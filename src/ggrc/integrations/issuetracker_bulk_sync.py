# Copyright (C) 2018 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""Bulk IssueTracker issues creation functionality."""

import collections
import datetime
import logging

from werkzeug import exceptions

import sqlalchemy as sa
from sqlalchemy.sql import expression as expr

from ggrc import models, db, login, settings
from ggrc.app import app
from ggrc.integrations import integrations_errors, issues
from ggrc.integrations.synchronization_jobs import sync_utils
from ggrc.models import all_models, inflector
from ggrc.models import exceptions as ggrc_exceptions
from ggrc.models.hooks.issue_tracker import integration_utils
from ggrc import utils
from ggrc.notifications import common
from ggrc.notifications.data_handlers import get_object_url
from ggrc.utils import benchmark

logger = logging.getLogger(__name__)

# IssueTracker sync errors
WRONG_COMPONENT_ERR = "Component {} does not exist"
WRONG_HOTLIST_ERR = "No Hotlist with id: {}"

# Email title
ISSUETRACKER_SYNC_TITLE = "Tickets generation status"


class IssueTrackerBulkCreator(object):
  """Class with methods for bulk tickets creation in issuetracker."""

  # IssueTracker integration modules with handlers for specific models
  INTEGRATION_HANDLERS = {
      "Assessment": models.hooks.issue_tracker.assessment_integration,
      "Issue": models.hooks.issue_tracker.issue_integration,
  }

  SUCCESS_TITLE = (
      'Ticket generation for your GGRC import {filename} was completed '
      'successfully'
  )
  SUCCESS_TEXT = (
      'The assessments or the issues from the import file that required '
      'tickets generation (had tickets integration turned on) have been '
      'successfully linked with the tickets.'
  )
  ERROR_TITLE = (
      'There were some errors in generating tickets for your GGRC import '
      '{filename}'
  )
  ERROR_TEXT = (
      'There were errors that prevented generation of some tickets based on '
      'your import file submission. The error may be due to your lack to '
      'sufficient access to generate/update the tickets. Here is the list of '
      'assessments or issues that were not updated.'
  )
  EXCEPTION_TEXT = "Something went wrong, we are looking into it."

  def __init__(self):
    self.break_on_errs = False
    self.client = issues.Client()

  def sync_issuetracker(self, request_data):
    """Generate IssueTracker issues in bulk.

    Args:
        request_data: {
            'objects': [object_type, object_id, hotlist_ids, component_id],
            'mail_data': {user_email: email, filename: filename}
        }
        objects list contains objects to by synchronized,
        mail_data contains information for email notification(file that was
          imported name and recipient email)
    Returns:
        flask.wrappers.Response - response with result of generation.
    """
    objects_data = request_data.get("objects")

    filename = request_data.get("mail_data", {}).get("filename", '')
    recipient = request_data.get("mail_data", {}).get("user_email", '')

    try:
      issuetracked_info = []
      with benchmark("Load issuetracked objects from database"):
        objects_info = self.group_objs_by_type(objects_data)
        for obj_type, obj_id_info in objects_info.items():
          for obj in self.get_issuetracked_objects(obj_type,
                                                   obj_id_info.keys()):
            issuetracked_info.append(
                IssuetrackedObjInfo(obj, *obj_id_info[obj.id])
            )

      created, errors = self.handle_issuetracker_sync(issuetracked_info)

      logger.info(
          "Synchronized issues count: %s, failed count: %s",
          len(created),
          len(errors),
      )
    except:  # pylint: disable=bare-except
      self.send_notification(filename, recipient, failed=True)
      return (None, None)
    else:
      if created or errors:
        self.send_notification(filename, recipient, errors=errors)
    return (created, errors)

  @staticmethod
  def group_objs_by_type(object_data):
    """Group objects data by obj type."""
    objects_info = collections.defaultdict(dict)
    for obj in object_data:
      objects_info[obj.get("type")][obj.get("id")] = (
          obj.get("hotlist_ids"),
          obj.get("component_id"),
      )
    return objects_info

  @staticmethod
  def get_issuetracked_objects(obj_type, obj_ids):
    """Fetch issuetracked objects from db."""
    issuetracked_model = inflector.get_model(obj_type)
    return issuetracked_model.query.join(
        all_models.IssuetrackerIssue,
        sa.and_(
            all_models.IssuetrackerIssue.object_type == obj_type,
            all_models.IssuetrackerIssue.object_id == issuetracked_model.id
        )
    ).filter(
        all_models.IssuetrackerIssue.object_id.in_(obj_ids),
        all_models.IssuetrackerIssue.issue_id.is_(None),
        all_models.IssuetrackerIssue.enabled != 0,
    ).options(
        sa.orm.Load(issuetracked_model).undefer_group(
            "{}_complete".format(obj_type),
        )
    )

  def handle_issuetracker_sync(self, tracked_objs):
    """Create IssueTracker issues for tracked objects in bulk.

    Args:
        tracked_objs: [(object_type, object_id)][object] - tracked object info.

    Returns:
        Tuple with dicts of created issue info and errors.
    """
    errors = []
    created = {}

    # IssueTracker server api doesn't support collection post, thus we
    # create issues in loop.
    for obj_info in tracked_objs:
      try:
        if not self.bulk_sync_allowed(obj_info.obj):
          raise exceptions.Forbidden()

        issue_json = self._get_issue_json(obj_info.obj)
        self._populate_issue_json(obj_info, issue_json)

        issue_id = getattr(obj_info.obj.issuetracker_issue, "issue_id", None)
        with benchmark("Synchronize issue for {} with id {}".format(
            obj_info.obj.type, obj_info.obj.id
        )):
          res = self.sync_issue(issue_json, issue_id)

        self._process_result(res, issue_json)
        created[(obj_info.obj.type, obj_info.obj.id)] = issue_json
      except integrations_errors.Error as error:
        self._add_error(errors, obj_info.obj, error)
        self._disable_integration(obj_info.obj)
        if self.break_on_errs and getattr(error, "data", None) in (
            WRONG_HOTLIST_ERR.format(issue_json["hotlist_ids"][0]),
            WRONG_COMPONENT_ERR.format(issue_json["component_id"]),
        ):
          break
      except (TypeError, ValueError, ggrc_exceptions.ValidationError,
              exceptions.Forbidden) as error:
        self._add_error(errors, obj_info.obj, error)

    with benchmark("Update issuetracker issues in db"):
      self.update_db_issues(created)
    return created, errors

  @staticmethod
  def _disable_integration(obj):
    """Disable Issue Tracker integration for object"""
    all_models.IssuetrackerIssue.create_or_update_from_dict(
        obj,
        {"enabled": False}
    )

  def _get_issue_json(self, object_):
    """Get json data for issuetracker issue related to provided object."""
    issue_json = None
    integration_handler = self.INTEGRATION_HANDLERS.get(object_.type)
    if hasattr(integration_handler, "prepare_issue_json"):
      issue_json = integration_handler.prepare_issue_json(
          object_,
          issue_tracker_info=object_.issue_tracker,
          create_issuetracker=True,
      )

    if not issue_json:
      raise integrations_errors.Error(
          "Can't create issuetracker issue json for {}".format(object_.type)
      )
    return issue_json

  @staticmethod
  def _populate_issue_json(obj_info, issue_json):
    """Populate issue json with parameters from request."""
    if obj_info.hotlist_ids:
      issue_json["hotlist_ids"] = obj_info.hotlist_ids
    if obj_info.component_id:
      issue_json["component_id"] = obj_info.component_id
    integration_utils.normalize_issue_tracker_info(issue_json)

  @staticmethod
  def _process_result(result, issue_json):
    """Process result of issuetracker synchronization."""
    if result and not issue_json.get("issue_id"):
      issue_json["enabled"] = True
      issue_json["issue_id"] = result.get("issueId")
      issue_json["issue_url"] = integration_utils.build_issue_tracker_url(
          result.get("issueId")
      )
    elif not result and not issue_json.get("issue_id"):
      raise integrations_errors.Error("Unknown error")

    if not issue_json.get("assignee") and result:
      issue_json["assignee"] = result.get("issueState", {}).get("assignee")

  @staticmethod
  def _add_error(error_list, object_, error):
    """Save error information"""
    logger.error("Issue sync failed with error: %s", str(error))
    error_list.append((object_, str(error)))

  def sync_issue(self, issue_json, issue_id=None):
    """Create new issue in issuetracker with provided params."""
    del issue_id
    return sync_utils.create_issue(
        self.client,
        issue_json,
        max_attempts=10,
        interval=10
    )

  @staticmethod
  def bulk_sync_allowed(obj):
    """Check if user has permissions to synchronize issuetracker issue.

    Returns:
        True if it's allowed, False if not allowed.
    """
    del obj
    return True

  def update_db_issues(self, issues_info):
    """Update db IssueTracker issues with provided data.

    Args:
        issues_info: Dict with issue properties.
    """
    if not issues_info:
      return
    issuetracker = all_models.IssuetrackerIssue.__table__
    stmt = issuetracker.update().where(
        sa.and_(
            issuetracker.c.object_type == expr.bindparam("object_type_"),
            issuetracker.c.object_id == expr.bindparam("object_id_"),
        )
    ).values({
        "cc_list": expr.bindparam("cc_list"),
        "enabled": expr.bindparam("enabled"),
        "title": expr.bindparam("title"),
        "component_id": expr.bindparam("component_id"),
        "hotlist_id": expr.bindparam("hotlist_id"),
        "issue_type": expr.bindparam("issue_type"),
        "issue_priority": expr.bindparam("issue_priority"),
        "issue_severity": expr.bindparam("issue_severity"),
        "assignee": expr.bindparam("assignee"),
        "issue_id": expr.bindparam("issue_id"),
        "issue_url": expr.bindparam("issue_url"),
    })

    try:
      update_values = self.create_update_values(issues_info)
      db.session.execute(stmt, update_values)
      self.log_issues(issues_info.keys())
      db.session.commit()
    except sa.exc.OperationalError as error:
      logger.exception(error)
      raise exceptions.InternalServerError(
          "Failed to update created IssueTracker issues in database."
      )

  @staticmethod
  def create_update_values(issue_info):
    """Prepare issue data for bulk update in db.

    Args:
        issue_json: Dict with issue properties.

    Returns:
        List of dicts with issues data to update in db.
    """
    return [{
        "object_type_": obj_type,
        "object_id_": obj_id,
        "cc_list": ",".join(info.get("ccs", [])),
        "enabled": info["enabled"],
        "title": info["title"],
        "component_id": info["component_id"],
        "hotlist_id": info["hotlist_ids"][0] if info["hotlist_ids"] else None,
        "issue_type": info["type"],
        "issue_priority": info["priority"],
        "issue_severity": info["severity"],
        "assignee": info["assignee"],
        "issue_id": info["issue_id"],
        "issue_url": info["issue_url"],
    } for (obj_type, obj_id), info in issue_info.items()]

  def log_issues(self, issue_objs):
    """Create log information about issues such as event and revisions.

    Args:
        issue_objs: [(obj_type, obj_id)] List with types and ids of objects.
    """
    current_user_id = login.get_current_user_id()
    event_id_query = all_models.Event.__table__.insert().values(
        modified_by_id=current_user_id,
        action='BULK',
        resource_id=0,
        resource_type=None,
    )
    try:
      event_id = db.session.execute(event_id_query).inserted_primary_key[0]
      self.create_revisions(issue_objs, event_id, current_user_id)
    except sa.exc.OperationalError as error:
      logger.exception(error)

  @staticmethod
  def create_revisions(resources, event_id, user_id):
    """Create revisions for provided objects in bulk.

    Args:
        resources: [(obj_type, obj_id)] List with types and ids of objects.
        event_id: id of event that lead to revisions creation.
        user_id: id of user for which revisions should be created.
    """
    issue_objs = all_models.IssuetrackerIssue.query.filter(
        sa.tuple_(
            all_models.IssuetrackerIssue.object_type,
            all_models.IssuetrackerIssue.object_id
        ).in_(resources)
    )
    revision_data = [
        {
            "resource_id": obj.id,
            "resource_type": obj.type,
            "event_id": event_id,
            "action": 'modified',
            "content": obj.log_json(),
            "resource_slug": None,
            "source_type": None,
            "source_id": None,
            "destination_type": None,
            "destination_id": None,
            "updated_at": datetime.datetime.utcnow(),
            "modified_by_id": user_id,
            "created_at": datetime.datetime.utcnow(),
            "context_id": obj.context_id,
        }
        for obj in issue_objs
    ]
    inserter = all_models.Revision.__table__.insert()
    db.session.execute(inserter.values(revision_data))

  @staticmethod
  def make_response(errors):
    """Create response with provided body and status.

    Args:
        errors: List with errors to return in response.

    Returns:
        Created response.
    """
    error_list = []
    for obj, err in errors:
      error_list.append((obj.type, obj.id, err))

    return app.make_response((
        utils.as_json({"errors": error_list}),
        200,
        [("Content-Type", "application/json")]
    ))

  def send_notification(self, filename, recipient, errors=None, failed=False):
    """Send mail notification with information about errors."""
    data = {}
    if failed:
      data["title"] = self.ERROR_TITLE.format(filename=filename)
      data["email_text"] = self.EXCEPTION_TEXT
      body = settings.EMAIL_BULK_SYNC_EXCEPTION.render(sync_data=data)
    elif errors:
      data["objects"] = [
          {
              "url": get_object_url(obj),
              "code": obj.slug,
              "title": obj.title,
          } for (obj, _) in errors
      ]
      data["title"] = self.ERROR_TITLE.format(filename=filename)
      data["email_text"] = self.ERROR_TEXT.format(filename=filename)
      body = settings.EMAIL_BULK_SYNC_FAILED.render(sync_data=data)
    else:
      data["title"] = self.SUCCESS_TITLE.format(filename=filename)
      data["email_text"] = self.SUCCESS_TEXT.format(filename=filename)
      body = settings.EMAIL_BULK_SYNC_SUCCEEDED.render(sync_data=data)

    common.send_email(recipient, ISSUETRACKER_SYNC_TITLE, body)


class IssueTrackerBulkUpdater(IssueTrackerBulkCreator):
  """Class with methods for bulk tickets update in issuetracker."""

  SUCCESS_TITLE = (
      'Ticket update for your GGRC import {filename} was completed '
      'successfully.'
  )
  SUCCESS_TEXT = (
      'The assessments or the issues from the import file that required '
      'tickets updates have been successfully updated.'
  )
  ERROR_TITLE = (
      'There were some errors in updating tickets for your GGRC import '
      '{filename}'
  )
  ERROR_TEXT = (
      'There were errors that prevented updates of some tickets based on '
      'your import file submission. The error may be due to your lack to '
      'sufficient access to generate/update the tickets. Here is the list '
      'of assessments or issues that were not updated.'
  )

  @staticmethod
  def get_issuetracked_objects(obj_type, obj_ids):
    """Fetch issuetracked objects from db."""
    issuetracked_model = inflector.get_model(obj_type)
    return issuetracked_model.query.join(
        all_models.IssuetrackerIssue,
        sa.and_(
            all_models.IssuetrackerIssue.object_type == obj_type,
            all_models.IssuetrackerIssue.object_id == issuetracked_model.id
        )
    ).filter(
        all_models.IssuetrackerIssue.object_id.in_(obj_ids),
        all_models.IssuetrackerIssue.issue_id.isnot(None),
        all_models.IssuetrackerIssue.enabled != 0,
    ).options(
        sa.orm.Load(issuetracked_model).undefer_group(
            "{}_complete".format(obj_type),
        )
    )

  def sync_issue(self, issue_json, issue_id=None):
    """Update existing issue in issuetracker with provided params."""
    return sync_utils.update_issue(
        self.client,
        issue_id,
        issue_json,
        max_attempts=10,
        interval=10
    )

  def _get_issue_json(self, object_):
    """Get json data for issuetracker issue related to provided object."""
    issue_json = None
    integration_handler = self.INTEGRATION_HANDLERS.get(object_.type)
    if hasattr(integration_handler, "prepare_issue_update_json"):
      issue_json = integration_handler.prepare_issue_update_json(object_)

    if not issue_json:
      raise integrations_errors.Error(
          "Can't create issuetracker issue json for {}".format(object_.type)
      )
    return issue_json

  @staticmethod
  def _disable_integration(obj):
    """We shouldn't disable integration for bulk update.

    All data would be synced via chron job a bit later and it wouldn't be
    a problem.
    """
    pass


class IssueTrackerBulkChildCreator(IssueTrackerBulkCreator):
  """Class with methods for bulk tickets creation for child objects."""

  def __init__(self):
    super(IssueTrackerBulkChildCreator, self).__init__()
    self.break_on_errs = True

  # pylint: disable=arguments-differ
  def sync_issuetracker(self, parent_type, parent_id, child_type):
    """Generate IssueTracker issues in bulk for child objects.

    Args:
        parent_type: type of parent object
        parent_id: id of parent object
        child_type: type of child object

    Returns:
        flask.wrappers.Response - response with result of generation.
    """
    errors = []
    try:
      issuetracked_info = []
      with benchmark("Load issuetracked objects from database"):
        handler = self.INTEGRATION_HANDLERS[child_type]
        if not hasattr(handler, "load_issuetracked_objects"):
          raise integrations_errors.Error(
              "Creation issues for {} in scope of {} is not supported.".format(
                  parent_type, child_type
              )
          )
        handler.create_missing_issuetrackerissues(parent_type, parent_id)
        for obj in handler.load_issuetracked_objects(parent_type, parent_id):
          issuetracked_info.append(IssuetrackedObjInfo(obj))

      created, errors = self.handle_issuetracker_sync(issuetracked_info)

      logger.info("Synchronized issues count: %s, failed count: %s",
                  len(created), len(errors))
    except:  # pylint: disable=bare-except
      self.send_notification(parent_type, parent_id, failed=True)
    else:
      self.send_notification(parent_type, parent_id, errors=errors)
    return self.make_response(errors)

  def bulk_sync_allowed(self, obj):
    """Check if user has permissions to synchronize issuetracker issue.

    Args:
        obj: instance for which issue should be generated/updated.

    Returns:
        True if it's allowed, False if not allowed.
    """
    handler = self.INTEGRATION_HANDLERS.get(obj.type)
    allow_func = getattr(
        handler,
        "bulk_children_gen_allowed",
        self.bulk_sync_allowed
    )
    return allow_func(obj)

  @staticmethod
  def send_notification(parent_type, parent_id, errors=None, failed=False):
    """Send mail notification with information about errors."""
    parent_model = models.get_model(parent_type)
    parent = parent_model.query.get(parent_id)

    data = {"title": parent.title}
    if failed:
      body = settings.EMAIL_BULK_CHILD_SYNC_EXCEPTION.render()
    elif errors:
      data["assessments"] = [
          {
              "url": get_object_url(obj),
              "code": obj.slug,
              "title": obj.title,
          } for (obj, _) in errors
      ]
      body = settings.EMAIL_BULK_CHILD_SYNC_FAILED.render(sync_data=data)
    else:
      body = settings.EMAIL_BULK_CHILD_SYNC_SUCCEEDED.render(sync_data=data)

    receiver = login.get_current_user()
    common.send_email(receiver.email, ISSUETRACKER_SYNC_TITLE, body)

  @staticmethod
  def _disable_integration(obj):
    """We shouldn't disable integration for bulk child create.

    We enable integration for child assessments(set enabled=True in our DB)
    when we've synced it with Issue Tracker using _process_result method.
    """
    pass


class IssuetrackedObjInfo(collections.namedtuple(
    "IssuetrackedObjInfo", ["obj", "hotlist_ids", "component_id"]
)):
  """Class for keeping Issuetracked objects info."""
  __slots__ = ()

  def __new__(cls, obj, hotlist_ids=None, component_id=None):
    if hotlist_ids and not isinstance(hotlist_ids, list):
      hotlist_ids = [hotlist_ids]
    return super(IssuetrackedObjInfo, cls).__new__(
        cls, obj, hotlist_ids, component_id
    )


class IssueTrackerCommentUpdater(IssueTrackerBulkUpdater):
  """This class should sync comments added to issuetracked objects."""

  def sync_issuetracker(self, request_data):
    """Generate IssueTracker issues in bulk.

    Args:
        request_data: {
            'comments': [object_type, object_id, comment_description],
            'mail_data': {user_email: email}
        }
        Comments list contains objects to by synchronized and comment that
        was added to this object. This list can contain multiply comments to
        single object. Several items would be placed to comments list in that
        case.
    Returns:
        flask.wrappers.Response - response with result of generation.
    """
    objects_data = request_data.get("comments", [])
    author = request_data.get("mail_data", {}).get("user_email", '')
    issuetracked_info = []
    with benchmark("Load issuetracked objects from database"):
      objects_info = self.group_objs_by_type(objects_data)
      for obj_type, obj_id_info in objects_info.items():
        for obj in self.get_issuetracked_objects(obj_type,
                                                 obj_id_info.keys()):
          for comment in obj_id_info[obj.id]:
            issuetracked_info.append({
                "obj": obj,
                "comment": comment
            })
    created, errors = self.handle_issuetracker_sync(issuetracked_info, author)
    logger.info(
        "Synchronized comments for issues count: %s, failed count: %s",
        len(created),
        len(errors),
    )
    return self.make_response(errors)

  # pylint: disable=arguments-differ
  def handle_issuetracker_sync(self, tracked_objs, author):
    """Create comments to IssueTracker issues for tracked objects in bulk.

    Args:
        tracked_objs: [{obj: object, comment:comment}] - tracked object info.
        It contains object and single comment that was added to it.

        It can be multiple comments to the same object. That means it would be
        several elements in this list for this object.
        author - author of comments that were added via bulk operations.
    Returns:
        Tuple with dicts of created issue info and errors.
    """
    errors = []
    created = {}

    # IssueTracker server api doesn't support collection post, thus we
    # create issues in loop.
    for obj_info in tracked_objs:
      try:
        issue_json = self._get_issue_json(obj_info["obj"],
                                          obj_info["comment"],
                                          author)

        issue_id = obj_info["obj"].issuetracker_issue.issue_id
        with benchmark("Synchronize issue for {} with id {}".format(
            obj_info["obj"].type, obj_info["obj"].id
        )):
          res = self.sync_issue(issue_json, issue_id)

        self._process_result(res, issue_json)
        created[(obj_info["obj"].type, obj_info["obj"].id)] = issue_json
      except (TypeError, ValueError, AttributeError, integrations_errors.Error,
              ggrc_exceptions.ValidationError, exceptions.Forbidden) as error:
        self._add_error(errors, obj_info["obj"], error)
    return created, errors

  @staticmethod
  def group_objs_by_type(object_data):
    """Group objects data by obj type."""
    objects_info = collections.defaultdict(
        lambda: collections.defaultdict(list)
    )
    for obj in object_data:
      objects_info[obj.get("type")][obj.get("id")].append(
          obj.get("comment_description")
      )
    return objects_info

  # pylint: disable=arguments-differ
  def _get_issue_json(self, object_, comment, author):
    """Get json data for IssueTracker issue related to provided object."""
    issue_json = None
    integration_handler = self.INTEGRATION_HANDLERS.get(object_.type)
    if hasattr(integration_handler, "prepare_comment_update_json"):
      issue_json = integration_handler.prepare_comment_update_json(object_,
                                                                   comment,
                                                                   author)

    if not issue_json:
      raise integrations_errors.Error(
          "Can't create issuetracker issue json for {}".format(object_.type)
      )
    return issue_json
