$(document).ready(function() {

  can.Component.extend({
    tag: "audit-info",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-info").html(can.view("/static/mockups/mustache/audit-revamp/info.mustache",{}));

  can.Component.extend({
    tag: "control",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-control").html(can.view("/static/mockups/mustache/audit-revamp/control.mustache",{}));

  can.Component.extend({
    tag: "ca",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-ca").html(can.view("/static/mockups/mustache/audit-revamp/control-assessments.mustache",{}));

  can.Component.extend({
    tag: "people",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-people").html(can.view("/static/mockups/mustache/audit-revamp/people.mustache",{}));

  can.Component.extend({
    tag: "program",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-program").html(can.view("/static/mockups/mustache/audit-revamp/program.mustache",{}));

  can.Component.extend({
    tag: "requests",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-requests").html(can.view("/static/mockups/mustache/audit-revamp/requests.mustache",{}));

  can.Component.extend({
    tag: "complete",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-complete").html(can.view("/static/mockups/mustache/audit-revamp/complete.mustache",{}));

  can.Component.extend({
    tag: "issues",
    scope: {
    },
    template: "<content/>",
    helpers: {
    },
    events: {
    }
  });
  $(".object-wrap-issues").html(can.view("/static/mockups/mustache/audit-revamp/issues.mustache",{}));

  function innerNavTrigger() {
    var $this = $(this),
        $allList = $this.closest(".nav").children("li"),
        $list = $this.closest("li"),
        aId = $this.attr("href"),
        $element = $("div"+aId);

    $allList.removeClass('active');
    $list.addClass('active');

    $(".object-wrap").hide();
    $(".object-wrap"+aId).show();
  }

  function personRole() {
    $('#PersonRole').modal('hide');
    $('#personAuth').html('Audit member');
    $('#personAuth2').html('Audit member');
  }

  function generateCA() {
    $("#ca .content").find(".tree-structure").find(".tree-item").show();
    $("#ca .content").find(".tree-structure").find(".zero-state").hide();
    $("#CACounter").html("4");
  }

  $(".top-inner-nav a").on("click", innerNavTrigger);

  $("#autoGenerateCA").on("click", generateCA);

  $("#auditRoleSave").on('click', personRole);

});
