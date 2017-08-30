/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var skip_test = false;
var make_test = !skip_test;
var allowed_branches = ["A1", "B1", "B2", "C1", "C2", "DAR", "E1", "E2", "E3", "I1", "M1", "S1", "K1-Projekt"];

function validateForm(value) {
    var atpos = value.indexOf("@");
    var dotpos = value.lastIndexOf(".");
    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= value.length) {
        alert("Niepoprawny adres email.");
        return false;
    } else return true;
}

function HelpLogin() {
    $('#btn_help').click(function() { setTimeout(function() { $('#exampleUser').focus(); }, 0); });
    $('#btn_help_send').click(function() {
        var user = $('#exampleUser').val();
        var email = $('#exampleEmail').val();
        var text = $('#exampleTextarea').val();

        if (!validateForm(email))
            return;

        var message = "Czy na pewno chcesz wysłać?";
        var c = confirm(message);
        if (c) {
            $.ajax({
                url: "feedback.php",
                type: "POST",
                data: { key0: user, key1: email, key2: text },
                cache: false,
                dataType: "text",
                beforeSend: function() {
                    $('#myPleaseWait').modal('show');
                },
                success: function(result) {
                    $('#myPleaseWait').modal('hide');
                    alert(result);
                    $('#exampleUser').val('');
                    $('#exampleEmail').val('');
                    $('#exampleTextarea').val('');
                }
            });
        }
    });
}

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function change_language(result) {
    switch (result) {
        case 'PL':
            $.cookie('lang', 'pl');
            break;
        case 'EN':
            $.cookie('lang', 'en');
            break;
    }

    location.reload(true);
}

function show_mails() {
    var all_options = [{
            text: 'Nowe założenie',
            value: 1
        },
        {
            text: 'Nowa rewizja',
            value: 2
        },
        {
            text: 'Odczyt',
            value: 3
        },
        {
            text: 'Przegląd - zaakceptowane',
            value: 4
        },
        {
            text: 'Przegląd - wstępnie zaakceptowane',
            value: 5
        },
        {
            text: 'Przegląd - odrzucone',
            value: 6
        },
        {
            text: 'Uwagi od KP',
            value: 7
        },
        {
            text: 'Uwagi cząstkowe',
            value: 8
        },
        {
            text: 'Zmiana adresata',
            value: 9
        },
        {
            text: 'Zmiana KZP/PP',
            value: 10
        },
        {
            text: 'Poinformuj mnie o wyłączonych powiadomieniach',
            value: 11
        }
    ];

    $.ajax({
        url: "_tools/get_mail.php",
        type: "POST",
        cache: false,
        dataType: "json",
        success: function(result) {
            if (result.admin)
                all_options.push({ text: "Systemowe", value: 12 });

            bootbox.prompt({
                title: "Ustawienia powiadomień - wybierz, które chcesz otrzymywać",
                inputType: 'checkbox',
                inputOptions: all_options,
                value: result.values,
                buttons: {
                    confirm: {
                        label: 'Save',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'Close',
                        className: 'btn-warning',
                        value: "0"
                    }
                },
                callback: function(result) {
                    if (result) {
                        if (result.length == 0)
                            result = [0];

                        $.ajax({
                            url: "_tools/set_mail.php",
                            type: "POST",
                            data: { key0: result },
                            cache: false,
                            success: function() {
                                Notifications();
                            }
                        });
                    }
                }
            });
        },
        error: function(result) {
            alert(result.responseText);
        }
    });
}

function Notifications() {
    $.ajax({
        url: "_tools/list_mails.php",
        type: "POST",
        cache: false,
        dataType: "json",
        success: function(result) {
            if (result.remindme && result.totaloff > 0) {
                $("#form_remindme li").remove();
                $("#form_remindme ol").append(result.text);
                $("#form_remindme").removeClass("hidden");
            } else if (!$("#form_remindme").hasClass('hidden'))
                $("#form_remindme").addClass("hidden");
        }
    });
}

function RemindMeOff() {
    var message = "Czy na pewno chcesz wyłączyć komunikat o wyłączonych powiadomieniach?";
    bootbox.confirm(message, function(result) {
        if (result) {
            $.ajax({ url: "_tools/remindmeoff.php", type: "POST", cache: false });
            $("#form_remindme").addClass("hidden");
        }
    });
}

function HiddenAssm(value) {
    $.ajax({
        url: "_tools/hide.php",
        type: "POST",
        data: { key0: value },
        cache: false,
        success: function() {
            window.location.reload(true);
        }
    });
}

/*
 * Filling branches
 * @param {string} key
 * @param {string} value
 */
function OtherBranches(element, key, value) {
    $('#' + element + '_branches_check').append($("<option></option>")
        .attr("value", key)
        .text(value));
    $('#' + element + '_branches_adr').append($("<option></option>")
        .attr("value", key)
        .text(value));
}

function EventUsers(rev_string) {
    $('#' + rev_string + '_branches_check').change(function() {
        var str = $('#' + rev_string + '_branches_check option:selected').text();
        LoadUsers(str, '#' + rev_string + '_users_check');
    });

    $('#' + rev_string + '_branches_adr').change(function() {
        var str = $('#' + rev_string + '_branches_adr option:selected').text();
        LoadUsers(str, '#' + rev_string + '_users_adr_');
    });
}

function LoadUsers(branch, identifier) {
    if (branch == "")
        $(identifier).empty();
    else {
        $.ajax({
            url: "_tools/epk_u.php",
            type: "POST",
            data: { key0: branch },
            cache: false,
            dataType: "json",
            success: function(result) {
                $(identifier).empty();
                $.each(result, function(key, value) {
                    $(identifier).append($("<option></option>")
                        .attr("value", value.id)
                        .text(value.user));
                });
            }
        });
    }
}

function GetUser(branch, id_user, identifier) {
    if (branch == "")
        $(identifier).empty();
    else {
        $.ajax({
            url: "_tools/epk_u.php",
            type: "POST",
            data: { key0: branch },
            cache: false,
            dataType: "json",
            success: function(result) {
                $(identifier).empty();

                $.each(result, function(key, value) {
                    if (value.id == id_user) {
                        $(identifier).append($("<option></option>")
                            .attr("value", value.id)
                            .text(value.user));
                    }
                });
            }
        });
    }
}

/*****************/
/*
 * Loading events for page 'main'
 */
var columns = [];

function AllAssumptions(mycolumns) {
    //beforeSend: function ()
    //                {
    //                    $('#myPleaseWait').modal('show');
    //                },
    $.ajax({
        url: "_tools/g_projects.php",
        type: "POST",
        data: { key0: "all", key1: "", key2: "", key3: "" },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            $('#myPleaseWait').modal('show');
        },
        complete: function() {
            $('#myPleaseWait').modal('hide');
        },
        success: function(result) {
            ReadAssumptions(result, mycolumns);
        }
    });
    //    .done(function(result) {
    //        ReadAssumptions(result, mycolumns);
    //    });
}

function GetStatuses(statuses, element) {
    var count = 0;
    var color = "text-muted";
    if (!isNullOrWhitespace(statuses.id_adr2)) {
        count++;
        color = GetColor(statuses.status2);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr3)) {
        count++;
        color = GetColor(statuses.status3);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr4)) {
        count++;
        color = GetColor(statuses.status4);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr5)) {
        count++;
        color = GetColor(statuses.status5);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr6)) {
        count++;
        color = GetColor(statuses.status6);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr7)) {
        count++;
        color = GetColor(statuses.status7);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr8)) {
        count++;
        color = GetColor(statuses.status8);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr9)) {
        count++;
        color = GetColor(statuses.status9);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    if (!isNullOrWhitespace(statuses.id_adr10)) {
        count++;
        color = GetColor(statuses.status10);
        element.append('<span class="glyphicon glyphicon-envelope ' + color + '" style="margin-right:5px">');
    }

    return { result: element, count: count };
}

function GetColor(status) {
    var color = "text-muted";
    switch (status) {
        case "1":
            color = "status-waiting ";
            break;
        case "2":
            color = "status-enough";
            break;
        case "3":
            color = "status-rejected";
            break;
        case "4":
            color = "status-accepted";
            break;
    }

    return color;
}

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};

function SetColumns(mycolumns) {
    var columns = [];
    //columns.push({name: "lp", title: mycolumns.col1, type: "text", align: "center", width: 50});
    columns.push({ name: "code", title: mycolumns.col10, type: "text", align: "right", width: 150 });
    //kks
    columns.push({ name: "kks", title: "KKS", type: "text", align: "left", width: 100 });
    columns.push({ name: "subject", title: mycolumns.col2, type: "text", align: "left", width: 200 });
    columns.push({
        name: "date",
        title: mycolumns.col3,
        type: "text",
        align: "center",
        width: 100,
        cellRenderer: function(value, item) {
            return $("<td>").append(new Date(value).yyyymmdd());
        }
    });
    columns.push({
        name: "rev",
        title: mycolumns.col4,
        type: "select",
        align: "center",
        width: 80,
        items: [
            { Name: "", Id: "" },
            { Name: "000", Id: "000" },
            { Name: "001", Id: "001" },
            { Name: "002", Id: "002" },
            { Name: "003", Id: "003" },
            { Name: "004", Id: "004" },
            { Name: "005", Id: "005" },
            { Name: "006", Id: "006" },
            { Name: "007", Id: "007" },
            { Name: "008", Id: "008" },
            { Name: "009", Id: "009" },
            { Name: "010", Id: "010" }
        ],
        valueField: "Id",
        textField: "Name"
    });
    columns.push({ name: "subject_rev", title: mycolumns.col11, type: "text", align: "left", width: 200 });
    columns.push({ name: "auth", title: mycolumns.col5, type: "text", align: "right", width: 200 });
    columns.push({
        name: "status",
        title: mycolumns.col6,
        type: "select",
        align: "center",
        width: 100,
        items: [{ Name: "", Id: "" }, { Name: "brak", Id: "brak" }, { Name: "częściowe", Id: "częściowe" },
            { Name: "ostateczne", Id: "ostateczne" }
        ],
        valueField: "Id",
        textField: "Name"
    });
    columns.push({ name: "adr", title: mycolumns.col7, type: "text", align: "right", width: 180 });
    columns.push({ name: "received", title: mycolumns.col8, type: "text", align: "center", width: 120 });
    columns.push({
        name: "st_view",
        title: mycolumns.col9,
        type: "select",
        align: "left",
        width: 140,
        items: [{ Name: "", Id: "" }, { Name: "zaakceptowane", Id: "4" }, { Name: "warunkowo zaakceptowane", Id: "2" }, { Name: "odrzucone", Id: "3" },
            { Name: "oczekujące na przegląd", Id: "1" }
        ],
        valueField: "Id",
        textField: "Name",
        cellRenderer: function(value, item) {
            var color = "#d3d3d3 ";
            var text = "oczekujące";
            switch (value) {
                case "1":
                    color = "#d3d3d3";
                    text = "oczekujące na przegląd";
                    break;
                case "2":
                    color = "yellow";
                    text = "warunkowo zaakceptowane";
                    break;
                case "3":
                    color = "red";
                    text = "odrzucone";
                    break;
                case "4":
                    color = "lime";
                    text = "zaakceptowane";
                    break;
            }

            return $("<td>").css("backgroundColor", color).append(text);
        }
    });

    return columns;
}

function ReadAssumptions(result, mycolumns) {
    if (columns.length == 0)
        columns = SetColumns(mycolumns);

    var myfilter = {
        data: result,
        loadData: function(filter) {
            return $.grep(this.data, function(item) {
                var test1 = (item.subject_rev.toLowerCase().indexOf(filter.subject_rev.toLowerCase()) >= 0);
                var test2 = (item.subject.toLowerCase().indexOf(filter.subject.toLowerCase()) >= 0);
                var test3 = (item.date.toLowerCase().indexOf(filter.date.toLowerCase()) >= 0);
                var test4 = (!filter.rev || (item.rev == filter.rev));
                var test5 = (item.auth.toLowerCase().indexOf(filter.auth.toLowerCase()) >= 0);
                var test6 = (item.status.toLowerCase().indexOf(filter.status.toLowerCase()) >= 0);
                var test7 = (item.adr.toLowerCase().indexOf(filter.adr.toLowerCase()) >= 0);
                var test8 = (!filter.st_view || (item.st_view == filter.st_view));
                var test9 = (item.code.toLowerCase().indexOf(filter.code.toLowerCase()) >= 0);
                var test10 = (item.kks.toLowerCase().indexOf(filter.kks.toLowerCase()) >= 0);
                //var test11 = item.received ? (item.received.toLowerCase().indexOf(filter.received.toLowerCase()) >= 0) : false;
                var result = test1 && test2 && test3 && test4 && test5 && test6 && test7 && test9 && test8 && test10; // && test11;
                return result; //test4 &&test8 && 
            });
        }
    };

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "700px",
        inserting: false,
        editing: false,
        //paging: true,
        filtering: true,
        sorting: true,
        data: result,
        rowClick: function(args) { //rowDoubleClick
            window.location.href = "assumption.php?id=" + args.item.id;
        },
        controller: myfilter,
        fields: columns,
        noDataContent: "Nie ma."
    });

    $("#jsGrid").jsGrid("sort", "date", "desc");
}

function AssumptionEvents() {
    //ShowObjects("wybierz", "wybierz");
    //ShowContracts("wybierz", "wybierz");
    //ShowKKS("wybierz", "wybierz"); // number + object
    GetSearch("wybierz", "wybierz", "wybierz", 3);

    $('#search_objects').change(function() { ShowOutput(); });
    $('#search_contract').change(function() { ShowOutput(); });
    $('#search_kks').change(function() { ShowOutput(); });
    $('#kzp_pp').click(function() { bootbox.alert('W opracowaniu.'); });
    $('#new_assumption').click(function() { window.location.href = "new.php"; });
}

function ShowObjects(contract, kks) {
    //value - numer kontraktu
    //alert(contract + " | " + kks);
    $("#search_objects").empty();

    $.ajax({
        url: "_tools/g_objects.php",
        type: "POST",
        data: { key0: contract, key1: kks },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            //$('#myPleaseWait').modal('show');
        },
        success: function(result) {
            //$('#myPleaseWait').modal('hide');
            $.each(result, function(key, value) {
                $('#search_objects')
                    .append($("<option></option>")
                        .attr("value", value.code)
                        .text(value.value));
            });
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function ShowContracts(object, kks) {
    //alert(object + " | " + kks);
    $("#search_contract").empty();

    $.ajax({
        url: "_tools/g_contracts.php",
        type: "POST",
        data: { key0: object, key1: kks },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            //$('#myPleaseWait').modal('show');
        },
        success: function(result) {
            //$('#myPleaseWait').modal('hide');
            $.each(result, function(key, value) {
                $('#search_contract')
                    .append($("<option></option>")
                        .attr("value", value.contract)
                        .text(value.contract));
            });
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function ShowKKS(contract, object) {
    //ShowKKS(contracts, objects);
    //alert(contract + " | " + object);
    $("#search_kks").empty();

    $.ajax({
        url: "_tools/g_kks.php",
        type: "POST",
        data: { key0: contract, key1: object },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            //$('#myPleaseWait').modal('show');
        },
        success: function(result) {
            //$('#myPleaseWait').modal('hide');
            $.each(result, function(key, value) {
                $('#search_kks')
                    .append($("<option></option>")
                        .attr("value", value.kks)
                        .text(value.kks));
            });
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function ShowOutput() {
    var objects = $("#search_objects").val();
    var contracts = $("#search_contract").val();
    var kks = $("#search_kks").val();

    if (objects != "wybierz" && contracts == "wybierz")
        GetSearch(contracts, objects, kks, 1);
    else if (objects == "wybierz" && contracts != "wybierz")
        GetSearch(contracts, objects, kks, 2);
    else if (objects == "wybierz" && contracts == "wybierz")
        GetSearch(contracts, objects, kks, 3);

    GetProjects(objects, contracts, kks);
}

function GetSearch(contracts, objects, kks, selected_input) {
    $.ajax({
        url: "_tools/g_search.php",
        type: "POST",
        data: { key0: contracts, key1: objects, key2: kks, key3: selected_input },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            //$('#myPleaseWait').modal('show');
        },
        success: function(result) {
            if (selected_input == 2) {
                $("#search_objects").empty();
                $.each(result.search_objects, function(key, value) {
                    var temp_object = value.split('_');
                    $('#search_objects')
                        .append($("<option></option>")
                            .attr("value", temp_object[1])
                            .text(temp_object[0]));
                });
            }

            if (selected_input == 1) {
                $("#search_contract").empty();
                $.each(result.search_contract, function(key, value) {
                    $('#search_contract')
                        .append($("<option></option>")
                            .attr("value", value)
                            .text(value));
                });
            }

            if (selected_input == 3) {
                $("#search_objects").empty();
                $.each(result.search_objects, function(key, value) {
                    var temp_object = value.split('_');
                    $('#search_objects')
                        .append($("<option></option>")
                            .attr("value", temp_object[1])
                            .text(temp_object[0]));
                });

                $("#search_contract").empty();
                $.each(result.search_contract, function(key, value) {
                    $('#search_contract')
                        .append($("<option></option>")
                            .attr("value", value)
                            .text(value));
                });
            }

            $("#search_kks").empty();
            $.each(result.search_kks, function(key, value) {
                $('#search_kks')
                    .append($("<option></option>")
                        .attr("value", value)
                        .text(value));
            });

            $("#search_kks").val(kks);
            $("#search_objects").val(objects);
            $("#search_contract").val(contracts);
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function GetProjects(objects, contracts, kks) {
    $.ajax({
        url: "_tools/g_projects.php",
        type: "POST",
        data: { key0: "", key1: objects, key2: contracts, key3: kks },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            $('#myPleaseWait').modal('show');
        },
        success: function(result) {
            $('#myPleaseWait').modal('hide');
            ReadAssumptions(result);
        },
        error: function(result) {
            //alert(result.responseText);
            $('#myPleaseWait').modal('hide');
        }
    });
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function isInArray(array, search) {
    return $.inArray(search, array) >= 0;
}

//tutaj poprawic loop
function SetInputOtherAdr(str, rev_string) {
    for (var i = 2; i < 11; i++) {
        $('#' + rev_string + '_branches_adr_' + i).val(str);
        LoadUsers(str, '#' + rev_string + '_users_adr_' + i);
    }
}

function EventUsersNew(rev_string, isnew) {
    $('#' + rev_string + '_branches_adr_1').change(function() {
        var str = $('#' + rev_string + '_branches_adr_1 option:selected').text();
        LoadUsers(str, '#' + rev_string + '_users_adr_1');
    });

    if (isnew != "new") {
        $('#' + rev_string + '_branches_adr_2').change(function() {
            var str = $('#' + rev_string + '_branches_adr_2 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_2');
        });

        $('#' + rev_string + '_branches_adr_3').change(function() {
            var str = $('#' + rev_string + '_branches_adr_3 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_3');
        });

        $('#' + rev_string + '_branches_adr_4').change(function() {
            var str = $('#' + rev_string + '_branches_adr_4 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_4');
        });

        $('#' + rev_string + '_branches_adr_5').change(function() {
            var str = $('#' + rev_string + '_branches_adr_5 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_5');
        });

        $('#' + rev_string + '_branches_adr_6').change(function() {
            var str = $('#' + rev_string + '_branches_adr_6 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_6');
        });

        $('#' + rev_string + '_branches_adr_7').change(function() {
            var str = $('#' + rev_string + '_branches_adr_7 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_7');
        });

        $('#' + rev_string + '_branches_adr_8').change(function() {
            var str = $('#' + rev_string + '_branches_adr_8 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_8');
        });

        $('#' + rev_string + '_branches_adr_9').change(function() {
            var str = $('#' + rev_string + '_branches_adr_9 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_9');
        });

        $('#' + rev_string + '_branches_adr_10').change(function() {
            var str = $('#' + rev_string + '_branches_adr_10 option:selected').text();
            LoadUsers(str, '#' + rev_string + '_users_adr_10');
        });
    }
}

var selected_obj = "";

function LoadObjects(code) {
    selected_obj = "";
    $('#000_object').val('');

    $.ajax({
        url: "_tools/o_objects.php",
        type: "POST",
        data: { key0: code },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            $('#myPleaseWait').modal('show');
        },
        success: function(result) {
            $('#myPleaseWait').modal('hide');
            ResetBasicData('000');
            ResetKZP('000');
            $('#000_object').val(result[0].value);
            GetKP(code, result[0].code);
            GetKZP(code);
            selected_obj = result[0].code;
        },
        error: function(result) {
            $('#myPleaseWait').modal('hide');
        }
    });
}

function ResetBasicData(rev_string) {
    //$('#' + rev_string + '_contract').val('');
    $('#' + rev_string + '_object').val('');
    $('#' + rev_string + '_contractor').val('');
    $('#' + rev_string + '_name_kp').val('');
    $('#' + rev_string + '_id_kp').val('');
    $('#' + rev_string + '_kks').val('');
}

function ResetKZP(rev_string) {
    $('#' + rev_string + '_branches_adr_1').val('');
    LoadUsers('', '#000_users_adr_1');
}

function GetKP(value, code) {
    $.ajax({
        url: "_tools/o_kp.php",
        type: "POST",
        data: { key0: value, key1: code },
        cache: false,
        dataType: "json",
        success: function(result) {
            SetKP(result);
        }
    });
}

function SetKP(found) {
    var value = found.kp;
    $.ajax({
        url: "_tools/receive_kp.php",
        type: "POST",
        data: { key0: value },
        cache: false,
        dataType: "json",
        success: function(result) {
            $('#000_name_kp').val(result.name);
            $('#000_id_kp').val(result.id);
            $('#000_contractor').val(found.zlc);
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function GetKZP(value) {
    ResetKZP('000');
    $.ajax({
        url: "_tools/o_kzp.php",
        type: "POST",
        data: { key0: value },
        cache: false,
        dataType: "json",
        success: function(result) {
            //$('#myPleaseWait').modal('hide');
            SetKZP(result, value);
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function SetKZP(found, value) {
    var count = found.length;

    $.ajax({
        url: "_tools/receive_kzp.php",
        type: "POST",
        data: { key0: found },
        cache: false,
        dataType: "json",
        success: function(result) {
            var person = [];
            for (var i = 0; i < count; i++)
                person.push({ text: result[i]["branch"] + ">" + result[i]["name"], value: result[i]["id"] });

            FocusKZP(person, count, value);
        },
        error: function(result) {
            //$('#myPleaseWait').modal('hide');
        }
    });
}

function FocusKZP(person, count, value) {
    var selected_id = "-1";
    if (count == 0) {
        bootbox.alert('Nie znaleziono KZP/PP w umowie albo tej umowy nie ma w bazie AS400.<br>Proszę wskazać KZP/PP ręcznie.');
    } else if (count == 1) {
        selected_id = person[0]["value"];
        GetBranchbyID(selected_id, value);
    } else if (count > 1) {
        bootbox.prompt({
            title: "Proszę wybrać jednego KZP/PP.",
            inputType: 'select',
            inputOptions: person,
            callback: function(result) {
                selected_id = result;
                GetBranchbyID(selected_id, value);
            }
        });
    }
}

function GetBranchbyID(selected_id, value) {
    $.ajax({
        url: "_tools/epk_bu.php",
        type: "POST",
        data: { key0: selected_id },
        cache: false,
        dataType: "json",
        success: function(result) {
            var my_branch = result[0]["branch"];
            if (!isInArray(allowed_branches, my_branch))
                $('#000_branches_adr_1').append($("<option></option>").attr("value", my_branch).text(my_branch));

            setTimeout(function() { $('#000_branches_adr_1').val(my_branch); }, 500);
            LoadUsers(my_branch, '#000_users_adr_1');
            setTimeout(function() { $('#000_users_adr_1').val(selected_id); }, 500);
        }
    });
}

function CheckParameter(string) {
    return isNullOrWhitespace(getParameterByName(string)) ? false : true;
}

function FillValues() {
    var id_zpc = getParameterByName('copy');
    $.ajax({
        url: "_tools/get_assumption.php",
        type: "POST",
        data: { key0: id_zpc },
        cache: false,
        dataType: "json"
    }).done(function(result) {
        FillRevision(result);
    });
}

function FillRevision(data) {
    if (data.length == 0)
        return;

    var temp_data = data[data.length - 1];
    FillData(temp_data);

    selected_obj = temp_data.u_code;
    var temp_rev = temp_data.added;
    $('#000_assumption_text').val(temp_rev.subject);
    $('#000_assumption_complete').val(temp_rev.complete); //rev_temp.subject
    $('#000_assumption_status').val(temp_rev.status);

    var temp_folder = temp_rev.main + "/" + temp_rev.folder;

    $.ajax({
        url: "_tools/generate_uid.php",
        type: "POST",
        dataType: "json"
    }).done(function(data) {
        var target = data.hash + "/" + data.folder;
        $.ajax({ url: "_tools/copy.php", type: "POST", data: { key0: temp_folder, key1: target }, cache: false, dataType: "json" }).done(function(data) {
            if (data.result === 1) {
                $('#elfinder_000').elfinder({
                    url: 'elfinder/php/connector.minimal.php?folder=' + target + '&home=000', // connector URL (REQUIRED)
                    resizable: false,
                    defaultView: 'list',
                    reloadClearHistory: true,
                    useBrowserHistory: false,
                    commands: ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'rm', 'rename', 'mkdir', 'upload', 'search', 'info', 'view', 'sort', 'desc']
                });
            }
        });
    });
}

function NewEvents(copy) {
    SetBranchesAll("new");

    var rev_string = '000';
    $('#' + rev_string + '_contract').autocomplete({
        source: '_tools/o_contracts.php',
        select: function(e, ui) {
            LoadObjects(ui.item.number);
        }
    });

    $.ajax({
        url: "_tools/get_kks.php",
        type: "POST",
        cache: false,
        dataType: "json",
        success: function(result) {
            $('#' + rev_string + '_kks').autocomplete({
                source: result
            });
        }
    });

    if (!copy) {
        $.ajax({
            url: "_tools/generate_uid.php",
            type: "POST",
            dataType: "json"
        }).done(function(data) {
            var target = data.hash + "/" + data.folder;
            $('#elfinder_' + rev_string).elfinder({
                url: 'elfinder/php/connector.minimal.php?folder=' + target + '&home=' + rev_string, // connector URL (REQUIRED)
                resizable: false,
                defaultView: 'list',
                reloadClearHistory: true,
                useBrowserHistory: false,
                commands: ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'rm', 'rename', 'mkdir', 'upload', 'search', 'info', 'view', 'sort', 'desc']
            });
        });
    }

    $('#back').click(function() {
        window.location.href = "main.php";
    });

    $('#send').click(function() {
        SendAssumption(rev_string);
    });
}

function SendAssumption(rev_string) {
    var checked_values = CheckValues(rev_string);
    if (checked_values.count > 0) {
        if (skip_test) {
            bootbox.alert(checked_values.message);
            return;
        }
    }

    var element = $('#elfinder_' + rev_string).elfinder('instance');
    address = getParameterByName('folder', element.options.url);

    $.ajax({
        url: "_tools/files.php",
        type: "POST",
        data: { key0: address },
        cache: false,
        success: function(result) {
            var assumption = new NewAssumption(rev_string);
            var message = "Czy na pewno chcesz dodać nowe założenie?";
            if (result == 0)
                message = "Czy na pewno chcesz dodać nowe założenie bez załączników?";

            bootbox.confirm(message, function(result) {
                if (result) {
                    var element = $('#elfinder_' + rev_string).elfinder('instance');
                    address = getParameterByName('folder', element.options.url);
                    $.ajax({
                        url: "_tools/add_assumption.php",
                        type: "POST",
                        data: { key0: assumption, key1: address },
                        cache: false,
                        dataType: "text",
                        beforeSend: function() {
                            $('#myPleaseWait').modal('show');
                        },
                        success: function(result) {
                            $('#myPleaseWait').modal('hide');
                            window.location.href = "main.php";
                        },
                        error: function(result) {
                            $('#myPleaseWait').modal('hide');
                        }
                    }); //.done(function() { window.location.href = "main.php"; });
                }
            });
        }
    });
}

/*
 * 
 * functions for new assumption
 */

function CheckVar(number, rev_string, text) {
    var temp = $('#' + rev_string + '_panel_adr_' + number);
    var hidden = !temp.hasClass('hidden');
    var temp2 = !isNullOrWhitespace(text);

    return (hidden && temp2) ? 1 : 0;
}

function NewAssumption(rev_string) {
    this.object = $('#' + rev_string + '_object').val();
    this.object_code = selected_obj;
    this.number = $('#' + rev_string + '_contract').val();
    this.kks = $('#' + rev_string + '_kks').val();
    this.hpp = "";
    this.contr = $('#' + rev_string + '_contractor').val();
    this.kp_id = $('#' + rev_string + '_id_kp').val();

    if (make_test) {
        this.object = 'EL TURÓW';
        this.object_code = 'TUR+';
        this.number = '2015/381';
        this.kks = 'Inne';
        this.contr = 'ELTUR-SERWIS';
        this.kp_id = '368';
    }

    this.author_id = $('#' + rev_string + '_id_auth').val();
    this.author_name = $('#' + rev_string + '_users_auth').val();
    this.author_branch = $('#' + rev_string + '_branches_auth').val();

    this.member_id = $('#' + rev_string + '_users_adr_1 option:selected').val();
    this.member_branch = $('#' + rev_string + '_branches_adr_1 option:selected').text();

    this.subject = $('#' + rev_string + '_assumption_text').val();
    this.status = $('#' + rev_string + '_assumption_status').val();

    this.range = $('#' + rev_string + '_assumption_text').val();
    this.reason = $('#' + rev_string + '_assumption_notice').val();
    this.complete = $('#' + rev_string + '_assumption_complete').val();

    this.date_create = $.datepicker.formatDate("yy-mm-dd", new Date());

    this.notice_adr = $('#' + rev_string + '_notice_adr').val();
    this.notice_kp = $('#' + rev_string + '_notice_kp').val();
}

function isNullOrWhitespace(input) {

    if (typeof input === 'undefined' || input == null) return true;

    return input.replace(/\s/g, '').length < 1;
}

function CheckValues(rev_string) {
    var errors = '<div class="panel panel-default">';
    errors += '<div class="panel-heading">Proszę uzupełnić dane w poniższych polach nazwanych:</div>';
    errors += '<ul class="list-group">';

    var count_errors = 0;

    //na poczatek sprawdzamy dane podstawowe
    var _object = $('#' + rev_string + '_object').val();
    if (isNullOrWhitespace(_object)) {
        count_errors++;
        errors += '<li class="list-group-item">Obiekt</li>';
    }

    var _contract = $('#' + rev_string + '_contract').val();
    if (isNullOrWhitespace(_contract)) {
        count_errors++;
        errors += '<li class="list-group-item">Nr umowy</li>';
    }

    var _contractor = $('#' + rev_string + '_contractor').val();
    if (isNullOrWhitespace(_contractor)) {
        count_errors++;
        errors += '<li class="list-group-item">Zamawiający</li>';
    }

    //kierownik projektu
    var _id_kp = $('#' + rev_string + '_id_kp').val();
    if (isNullOrWhitespace(_id_kp)) {
        count_errors++;
        errors += '<li class="list-group-item">Kierownik projektu</li>';
    }

    var _kks = $('#' + rev_string + '_kks').val();
    if (isNullOrWhitespace(_kks)) {
        count_errors++;
        errors += '<li class="list-group-item">KKS</li>';
    }

    //autora nie trzeba ponieważ system automatycznie go dodał
    //var _id_auth = $('#' + rev_string + '_id_auth').val();
    //var _users_auth = $('#' + rev_string + '_users_auth').val();
    //var _branches_auth = $('#' + rev_string + '_branches_auth').val();

    //data jest wstawiona automatycznie
    //var _date_create = $.datepicker.formatDate("yy-mm-dd", new Date());

    //trzeba sprawdzić adresata
    var temp_number = 1;
    var _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
    if (isNullOrWhitespace(_branches_adr)) {
        count_errors++;
        errors += '<li class="list-group-item">Branża adresata</li>';

    }
    var _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
    if (isNullOrWhitespace(_users_adr)) {
        count_errors++;
        errors += '<li class="list-group-item">Nazwisko i imię adresata</li>';
    }

    //temat zalozenia + status + kompletność
    var _assumption_text = $('#' + rev_string + '_assumption_text').val();
    if (isNullOrWhitespace(_assumption_text)) {
        count_errors++;
        if (rev_string != '000')
            errors += '<li class="list-group-item">Zakres rewizji</li>';
        else errors += '<li class="list-group-item">Przedmiot założeń</li>';
    }

    if (rev_string == '000') {
        var _assumption_status = $('#' + rev_string + '_assumption_status').val();
        if (_assumption_status == "6") {
            count_errors++;
            errors += '<li class="list-group-item">Status założeń</li>';
        }
    }

    var _assumption_complete = $('#' + rev_string + '_assumption_complete').val();
    if (isNullOrWhitespace(_assumption_complete)) {
        count_errors++;
        errors += '<li class="list-group-item">Kompletność uwagi</li>';
    }

    //dodatkowe informacje dla kolejnych rewizj
    if (rev_string != '000') {
        var _assumption_notice = $('#' + rev_string + '_assumption_notice').val();
        if (isNullOrWhitespace(_assumption_notice)) {
            count_errors++;
            errors += '<li class="list-group-item">Powód rewizji</li>';
        }
    }

    errors += '</ul>';
    errors += '</div>';

    return { count: count_errors, message: errors };
}

function CheckAddedUsers(rev_string) {
    var errors = '<div class="panel panel-default">';
    errors += '<div class="panel-heading">Proszę uzupełnić dane w poniższych polach nazwanych:</div>';
    errors += '<ul class="list-group">';

    var count_errors = 0;

    var temp_number = 2;
    var _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    temp_number++;
    _hidden_panel = $('#' + rev_string + '_panel_adr_' + temp_number).hasClass('hidden');
    if (!_hidden_panel) {
        _branches_adr = $('#' + rev_string + '_branches_adr_' + temp_number + ' option:selected').text();
        if (isNullOrWhitespace(_branches_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Branża adresata ' + temp_number + '</li>';
        }

        _users_adr = $('#' + rev_string + '_users_adr_' + temp_number + ' option:selected').val();
        if (isNullOrWhitespace(_users_adr)) {
            count_errors++;
            errors += '<li class="list-group-item">Nazwisko i imię adresata  ' + temp_number + '</li>';
        }
    }

    errors += '</ul>';
    errors += '</div>';

    return { count: count_errors, message: errors };
}

function SetUser(branch, user, id) {
    $('#000_branches_auth').val(branch);
    $('#000_users_auth').val(user);
    $('#000_id_auth').val(id);
}

function SetUserByRev(rev_string, branch, user, id) {
    $('#' + rev_string + '_branches_auth').val(branch);
    $('#' + rev_string + '_users_auth').val(user);
    $('#' + rev_string + '_id_auth').val(id);

    var first_branch = $('#' + $('#basic_rev').val() + "_branches_adr_1").val();
    $('#' + rev_string + '_branches_adr_1').val(first_branch);
    LoadUsers(first_branch, '#' + rev_string + '_users_adr_1');
}

/**
functions for Assumption
***/
function MainBoardEvents() {
    $("a[data-tab-destination]").on('click', function() {
        var tab = $(this).attr('data-tab-destination');
        $("#" + tab).click();
    });

    $('#back').click(function() {
        window.location.href = "main.php";
    });

    $("a[href='#top']").click(function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });

    $('#generate_link').click(function() {
        bootbox.prompt({
            size: "small",
            title: "Wygenerowano link:",
            value: "https://zp.epk.com.pl/assumption.php?id=" + getParameterByName('id'),
            callback: function(result) { /* result = String containing user input if OK clicked or null if Cancel clicked */ }
        })
    });

    $('#view_history').click(function() {
        var dialog = bootbox.dialog({
            title: 'Historia ' + $('#tab-1').text(),
            message: '<div class="modal-body text-center"><i class="fa fa-spin fa-spinner"></i> Wczytuję historię założenia...</div>',
            className: 'modal-wide',
            buttons: {
                cancel: {
                    label: '<i class="fa fa-times"></i> Close'
                }
            }
        });
        dialog.init(function() {
            setTimeout(function() {
                $.ajax({
                    url: "_tools/get_history.php",
                    type: "POST",
                    data: { key0: getParameterByName('id') },
                    cache: false,
                    dataType: "text",
                    success: function(result) { dialog.find('.bootbox-body').html(result); }
                });
            }, 2000);
        });
    });

    $('#copy_assm').click(function() {
        bootbox.confirm('Czy na pewno chcesz skopiować założenie?', function(result) {
            if (result) {
                var link = "new.php?copy=" + getParameterByName('id');
                window.location.href = link;
            }
        });
    })

    $('#del_assm').click(function() {
        bootbox.prompt({
            title: "Proszę podać powód dezaktywacji założenia",
            inputType: 'textarea',
            callback: function(result) {
                if (result && !isNullOrWhitespace(result)) {
                    $.ajax({
                        url: "_tools/delete.php",
                        type: "POST",
                        data: { key0: getParameterByName('id'), key1: result },
                        cache: false,
                        dataType: "text"
                    }).done(function() {
                        window.location.href = "main.php";
                    });
                }
            }
        });
    });

    SetBranchesAll("all");
}

function SetBranchesAll(isnew) {
    var revisions = [];
    for (var i = 0; i < 11; i++)
        revisions.push(pad(i, 3));

    for (var i = 0; i < revisions.length; i++) {
        var rev_string = revisions[i];

        $.each(allowed_branches, function(key, value) {
            for (var j = 1; j < 10; j++) {
                $('#' + rev_string + '_branches_adr_' + j).append($("<option/>", {
                    value: value,
                    text: value
                }));
            }
        });

        EventUsersNew(rev_string, isnew); //"all");
    }
}

function SendNoticeKP(revision, id, data) {
    var selected_id = getParameterByName('id');
    var text = $('#' + revision + '_notice_kp').val();
    var rev_no = parseInt(revision);
    var message = "Czy na pewno chcesz dodać uwagi do tego założenia o rewizji " + revision + "?";
    bootbox.confirm(message, function(result) {
        if (result) {
            $.ajax({
                url: "_tools/send_kp.php",
                type: "POST",
                data: { key0: id, key1: selected_id, key2: rev_no, key3: text },
                cache: false,
                dataType: "text"
            }).done(function() {
                window.location.reload(true);
            });
        }
    });
}

function SendNotice(revision, id, data) {
    var selected_id = getParameterByName('id');
    var text = $('#' + revision + '_notice_adr_added').val();
    var status = $('#' + revision + '_status_checked_added').val();
    if (status == "3" && text == "")
        bootbox.alert("Nie można wystawić go bez uwag.\nProszę wpisać w uwagach.");
    else {
        var rev_no = parseInt(revision);
        var message = "Czy na pewno chcesz dodać uwagi do tego założenia o rewizji " + revision + "?";
        bootbox.confirm(message, function(result) {
            if (result) {
                $.ajax({
                    url: "_tools/send_notice.php",
                    type: "POST",
                    data: { key0: id, key1: selected_id, key2: rev_no, key3: text, key4: status },
                    cache: false,
                    dataType: "text"
                }).done(function() {
                    var first_user = $('#' + revision + '_recipients').val();
                    ShowNotice(first_user, rev_no, revision);
                });
            }
        });
    }
}

function ChangeStatusKZP(revision, data) {
    var selected_id = getParameterByName('id');
    var rev_no = parseInt(revision);
    var status = $('#' + revision + '_status_checked').val();
    
    var inputText = $('#' + revision + '_notice_adr').val();
    var oldText = $('#' + revision + '_old_notice_adr').val();
    //alert(inputText + " | " + oldText);
    if (selectedIndex == data) {
        bootbox.alert("Ten sam status przeglądu, proszę zmienić.");
        return;
    }

    $.ajax({
        url: "_tools/change_status_kzp.php",
        type: "POST",
        data: { key0: selected_id, key1: rev_no, key2: status },
        cache: false,
        dataType: "text"
    }).done(function(result) {
        window.location.reload(true);
    });
}

function SendNoticeKZP(revision, id, data) {
    var selected_id = getParameterByName('id');
    var text = $('#' + revision + '_notice_adr').val();
    var status = $('#' + revision + '_status_checked').val();

    if (status == "3" && text == "")
        bootbox.alert("Nie można wystawić go bez uwag.\nProszę wpisać w uwagach.");
    else {
        var rev_no = parseInt(revision);
        var message = "Czy na pewno chcesz dodać uwagi do tego założenia o rewizji " + revision + "?";
        bootbox.confirm(message, function(result) {
            if (result) {
                $.ajax({
                    url: "_tools/send_kzp.php",
                    type: "POST",
                    data: { key0: id, key1: selected_id, key2: rev_no, key3: text, key4: status },
                    cache: false,
                    dataType: "text"
                }).done(function(result) {
                    window.location.reload(true);
                });
            }
        });
    }
}

function AddRevision(id, branch, user) {
    var new_revision = parseInt($('#basic_rev').val()) + 1;
    var rev_string = pad(new_revision, 3);

    $('#' + rev_string + '_checking').detach();
    $('#' + rev_string + '_panel_a').toggleClass('col-lg-6 col-lg-12');
    //$('#' + rev_string + '_attachments').detach().appendTo('#' + rev_string + '_panel_b');

    var visible_tab = $('#' + rev_string + '_tab').is(":visible");
    if (!visible_tab)
        $('#' + rev_string + '_tab').removeClass('hidden');

    $("#tab-" + (new_revision + 2)).click();

    SetUserByRev(rev_string, branch, user, id);

    //$('#' + rev_string + '_branches_adr_1').prop('disabled', false);
    $('#' + rev_string + '_users_adr_1').prop('disabled', false);

    var selected_id = getParameterByName('id');
    $.ajax({
        url: "_tools/generate_folder.php",
        type: "POST",
        data: { key0: selected_id },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            $('#myPleaseWait').modal('show');
        },
        success: function(result) {
            $('#myPleaseWait').modal('hide');
            var target = result.hash + "/" + result.folder;
            $('#elfinder_' + rev_string).elfinder({
                url: 'elfinder/php/connector.minimal.php?folder=' + target + '&home=' + rev_string, // connector URL (REQUIRED)
                resizable: false,
                defaultView: 'list',
                reloadClearHistory: true,
                useBrowserHistory: false,
                commands: ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'rm', 'rename', 'mkdir', 'upload', 'search', 'info', 'view', 'sort', 'desc']
            });

        },
        error: function(result) {
            $('#myPleaseWait').modal('hide');
        }
    });

    $('#new_revision').addClass('hidden');
    $('#add_revision').removeClass('hidden');

    $('#add_revision').click(function() {
        var checked_values = CheckValues(rev_string);
        if (checked_values.count > 0) {
            bootbox.alert(checked_values.message);
            return;
        }

        var element = $('#elfinder_' + rev_string).elfinder('instance');
        address = getParameterByName('folder', element.options.url);

        $.ajax({
            url: "_tools/files.php",
            type: "POST",
            data: { key0: address },
            cache: false,
            success: function(result) {
                var message = "Czy na pewno chcesz wysłać nową rewizję?";
                if (result == 0)
                    message = "Czy na pewno chcesz wysłać nową rewizję bez załączników?";

                var revision = new NewAssumption(rev_string);
                bootbox.confirm(message, function(result) {
                    if (result) {
                        $.ajax({
                            url: "_tools/add_revision.php",
                            type: "POST",
                            data: { key0: selected_id, key1: new_revision, key2: revision, key3: address },
                            cache: false,
                            dataType: "text",
                            beforeSend: function() {
                                $('#myPleaseWait').modal('show');
                            },
                            success: function(result) {
                                $('#myPleaseWait').modal('hide');
                                window.location.href = "main.php";
                            },
                            error: function(result) {
                                $('#myPleaseWait').modal('hide');
                            }
                        }); //.done(function() { window.location.href = "main.php"; });
                    }
                });
            }
        });
    });
}

function CheckActivate(data) {
    var value = false;
    var selected_id = getParameterByName('id');
    $.ajax({
        url: "activate.php",
        type: "POST",
        data: { key0: data.id, key1: selected_id },
        cache: false
    }).done(function(result) {
        value = result;
    });

    return value;
}

var temp_user = [];

function OneAssumption(data) {
    temp_user = data;
    var selected_id = getParameterByName('id');
    $.ajax({
        url: "_tools/get_assumption.php",
        type: "POST",
        data: { key0: selected_id },
        cache: false,
        dataType: "json",
        beforeSend: function() {
            $('#myPleaseWait').modal('show');
        },
        success: function(result) {
            setTimeout(function() { CheckOwner(result); Mainboard(result); }, 2000);
        },
        error: function(result) {
            $('#myPleaseWait').modal('hide');
        }
    })
//    .done(function(result) {
//        setTimeout(function() { CheckOwner(result); Mainboard(result); }, 2000);
//    });
}

function CheckOwner(result) {
    var auth_branch = result[0].added.branch;
    var auth_id = result[0].added.auth_id;
    var user_branch = temp_user.branch;

    if (auth_branch == user_branch)
        $("#new_revision").removeClass('hidden');

    if ((temp_user.leader == 1 && temp_user.branch == auth_branch) || temp_user.chief == 1 || temp_user.admin == 1 || temp_user.id == auth_id)
        $("#del_assm").removeClass('hidden');
}

function Mainboard(result) {
    if (result.length > 0) {
        FillData(result[0]); //, result.length
        if (result[0].hidden)
            $("#del_assm").addClass('hidden');

        var max_rev = 11; //jak 4 rewizje to 4
        var rest = max_rev - result.length;
        if (rest == 0)
            $('#new_revision').addClass('hidden');

        ShowBoard_Data(result[result.length - 1]);

        for (var i = 0; i < result.length; i++) {
            var temp_rev = result[i].added;
            var str = "" + i;
            var temp_board = ('000' + str).substring(str.length);

            ShowBoard(temp_board);

            if (i < result.length - 1) {
                ShowBoard_Rev(temp_rev, temp_rev.rev, result[i], result, false);
                $('#' + temp_board + '_checking').prop('disabled', true); //zablokowac dodatkowo lewą stronę (żeby nie było do modyfikacji)
                $('#' + temp_board + '_maindata').prop('disabled', true);
            } else if (i == (result.length - 1)) {
                GetStatus(temp_board);
                ActivateButtons(temp_board);
                GetStatusPart(temp_board);
                ShowBoard_Rev(temp_rev, temp_rev.rev, result[i], result, true);
            }
        }
    }
    
    $('#myPleaseWait').modal('hide');
}

function ActivateButtons(rev_string) {
    for (var j = 2; j <= 10; j++) {
        var temp = '#' + rev_string + '_add_adr_' + j;
        $(temp).click(function() {
            var arr = this.id.split('_');
            var last_number = arr[arr.length - 1];
            temp = '#' + rev_string + '_panel_adr_' + last_number;
            $(temp).removeClass('hidden');
        });

        temp = '#' + rev_string + '_rem_adr_' + j;
        $(temp).click(function() {
            var arr = this.id.split('_');
            var last_number = arr[arr.length - 1];
            temp = '#' + rev_string + '_panel_adr_' + last_number;
            $(temp).addClass('hidden');
        });
    }
}

function RemoveButtons(rev_string) {
    for (var i = 1; i <= 10; i++) {
        var name = '#' + rev_string + '_buttons_adr_' + i;
        var element = $(name);
        element.remove();
    }
}

function ShowBoard(rev_string) {
    $('#' + rev_string + '_panel').removeClass('hidden');
    $('#' + rev_string + '_tab').removeClass('hidden');
}

function ShowBoard_Data(result) {
    $('#basic_contract').val(result.number);
    $('#basic_object').val(result.object);
    $('#basic_contractor').val(result.contr);
    $('#basic_kks').val(result.kks);
    $('#basic_rev').val(result.added.rev);
    $('#basic_kp').val(result.kp);
    $('#tab-1').text(result.code);
}

function GetStatus(rev_string) {
    var isDisabled = $("#" + rev_string + "_notice_adr").is(':disabled');
    $('#' + rev_string + '_status_checked').change(
        function() {
            var value = $("#" + this.id).val();
            if (!isDisabled) {
                if (value == 3 || value == 2) {
                    var message = "Podaj powód odrzucenia w uwagach do założeń.";
                    if (value == 2)
                        message = "Podaj powód w uwagach do założeń.";
                    bootbox.confirm({
                        size: "small",
                        message: message,
                        callback: function(result) {
                            if (result)
                                setTimeout(function() { $('#' + rev_string + '_notice_adr').focus(); }, 0);
                        }
                    });
                }
            }
        });
}

function GetStatusPart(rev_string) {
    $('#' + rev_string + '_status_checked_added').change(
        function() {
            var value = $("#" + this.id).val();
            if (value == 3) {
                bootbox.confirm({
                    size: "small",
                    message: "Podaj powód odrzucenia w uwagach do założeń.",
                    callback: function(result) {
                        if (result)
                            setTimeout(function() { $('#' + rev_string + '_notice_adr_added').focus(); }, 0);
                    }
                });
            }
        });
}

function FillData(data, count = 11) {
    for (var i = 0; i < count; i++) {
        var str = "" + i;
        var rev_string = ('000' + str).substring(str.length);
        $('#' + rev_string + '_contract').val(data.number);
        $('#' + rev_string + '_object').val(data.object);
        $('#' + rev_string + '_contractor').val(data.contr);
        $('#' + rev_string + '_kks').val(data.kks);
        $('#' + rev_string + '_name_kp').val(data.kp);
        $('#' + rev_string + '_id_kp').val(data.id_kp);
    }
}

function ChangeKZP(id_adr, name_adr, rev) {
    var id_adr_new = $('#' + rev + '_users_adr_1').val();
    var name_adr_new = $('#' + rev + '_users_adr_1 option:selected').text();
    var int_rev = parseInt(rev);

    var message = "Czy na pewno chcesz zmienić obecnego KZP/PP na " + name_adr_new + "?";
    bootbox.confirm(message, function(result) {
        if (result) {
            var selected_id = getParameterByName('id');
            $.ajax({
                url: "_tools/change_kzp.php",
                type: "POST",
                data: { key0: selected_id, key1: int_rev, key2: id_adr_new },
                cache: false,
                dataType: "text"
            }).done(function() {
                window.location.reload(true);
            });
        }
    });
}

function ChangeAddrAdded(rev_string) {
    var users = [];
    for (var i = 2; i <= 10; i++) {
        var _hidden_panel = $('#' + rev_string + '_panel_adr_' + i).hasClass('hidden');
        var _users_adr = $('#' + rev_string + '_users_adr_' + i + ' option:selected').val();
        var _users_adr_old = $('#' + rev_string + '_id_users_' + i).val();
        users.push({ id_user: _users_adr, number: i, old: _users_adr_old, hidden: _hidden_panel });
    }

    bootbox.confirm("Czy na pewno chcesz dodać/zmienić adresatów?",
        function(result) {
            if (result) {
                $('#' + rev_string + '_close_adr_added').click();
                $('#myPleaseWait').modal('show');

                var int_rev = parseInt(rev_string);
                var selected_id = getParameterByName('id');

                $.ajax({
                    url: "_tools/change_adr.php",
                    type: "POST",
                    data: { key0: selected_id, key1: int_rev, key2: users },
                    cache: false,
                    dataType: "text"
                }).success(function() {
                    //alert(result);
                    $('#myPleaseWait').modal('hide');
                    window.location.reload(true);
                });
            }
        }
    );
}

function ShowBoard_Rev(rev_temp, rev_string, user, result, canFill) {
    //author
    $('#' + rev_string + '_branch').val(rev_temp.branch);
    $('#' + rev_string + '_auth').val(rev_temp.auth);
    $('#' + rev_string + '_date').val(rev_temp.rec_date);
    $('#' + rev_string + '_branches_auth').val(rev_temp.branch).prop('disabled', true);
    $('#' + rev_string + '_users_auth').val(rev_temp.auth).prop('disabled', true);

    //address
    if (!isInArray(allowed_branches, rev_temp.branch1))
        $('#' + rev_string + '_branches_adr_1').append($("<option></option>").attr("value", rev_temp.branch1).text(rev_temp.branch1));

    $('#' + rev_string + '_branches_adr_1').val(rev_temp.branch1);
    if (!canFill) {
        $('#' + rev_string + '_users_adr_1')[0].options.length = 0;
        $('#' + rev_string + '_users_adr_1').append($("<option></option>").attr("value", rev_temp.id_adr).text(rev_temp.adr)).prop('disabled', true);
    } else {
        LoadUsers(rev_temp.branch1, '#' + rev_string + '_users_adr_1');
        setTimeout(function() { $('#' + rev_string + '_users_adr_1').val(rev_temp.id_adr); }, 2000);
    }

    $('#' + rev_string + '_users_check')[0].options.length = 0;
    $('#' + rev_string + '_users_check').append($("<option></option>").attr("value", rev_temp.id_adr).text(rev_temp.adr)).prop('disabled', true);
    $('#' + rev_string + '_branches_check')[0].options.length = 0;
    $('#' + rev_string + '_branches_check').append($("<option></option>").attr("value", rev_temp.branch1).text(rev_temp.branch1)).prop('disabled', true);

    $('#' + rev_string + '_assumption_text').val(rev_temp.subject).prop('readonly', true);
    $('#' + rev_string + '_assumption_notice').val(rev_temp.reason).prop('readonly', true); //rev_temp.notice
    $('#' + rev_string + '_assumption_complete').val(rev_temp.complete).prop('readonly', true); //rev_temp.subject
    $('#' + rev_string + '_assumption_status').val(rev_temp.status).prop('disabled', true);

    $('#' + rev_string + '_complete_text').val(rev_temp.complete).prop('readonly', true);

    $('#' + rev_string + '_date_get').append(rev_temp.date_received);
    $('#' + rev_string + '_date_check').append(rev_temp.date_checked_rec);

    $('#' + rev_string + '_status_checked').val(rev_temp.status1); //rev_temp.status

    $('#' + rev_string + '_notice_adr').val(rev_temp.rec_notice);
    $('#' + rev_string + '_old_notice_adr').val(rev_temp.rec_notice);

    $('#' + rev_string + '_notice_kp').val(rev_temp.kp_notice);
    $('#' + rev_string + '_date_checked').append(rev_temp.date_checked_kp);

    if (canFill) {
        $('#' + rev_string + '_att_adr_add').on('click', function() { LoadAttachments('_recipients', '_date_received', rev_string, rev_temp.main, rev_temp.folder); });
        $('#' + rev_string + '_att_adr_kzp').on('click', function() { LoadAttachments('_users_check', '_date_check', rev_string, rev_temp.main, rev_temp.folder); });
        
        if ((temp_user.leader == 1 && temp_user.branch == rev_temp.branch1) || temp_user.chief == 1 || temp_user.admin == 1) {
            $('#' + rev_string + '_change_adr_add').removeClass('hidden');
            $('#' + rev_string + '_change_adr').removeClass('hidden');
            $('#' + rev_string + '_branches_adr_1').prop('disabled', false);
            $('#' + rev_string + '_users_adr_1').prop('disabled', false);
            $('#' + rev_string + '_change_adr').on('click', function() { ChangeKZP(rev_temp.id_adr, rev_temp.adr, rev_string); });
            $('#' + rev_string + '_changed_adr_added').on('click', function() { ChangeAddrAdded(rev_string); });
        } else if (temp_user.id == rev_temp.id_adr) {
            $('#' + rev_string + '_change_adr_add').removeClass('hidden');
            $('#' + rev_string + '_changed_adr_added').on('click', function() { ChangeAddrAdded(rev_string); });
        }

        SetInputOtherAdr(rev_temp.branch1, rev_string);
        ShowAllAddress(rev_temp, rev_string);
        ShowAllStatuses(rev_temp, rev_string);
        if ($('#' + rev_string + '_recipients')[0].options.length == 0)
            SetInputOtherAdr(rev_temp.branch1, rev_string);

        if (rev_temp.id_adr == temp_user.id) {
            if (isNullOrWhitespace(rev_temp.date_checked_rec)) {
                $('#' + rev_string + '_status_checked').prop('disabled', false);
                $('#' + rev_string + '_adr').prop('disabled', false);
                $('#' + rev_string + '_send_adr').on('click', function() { SendNoticeKZP(rev_string, temp_user.id, result); });
            } else {
                //tutaj na zmianę statusu
                $('#' + rev_string + '_status_checked').prop('disabled', false);
                var status_temp = rev_temp.status1;
                switch (status_temp) {
                    case "2":
                        $("#" + rev_string + "_status_checked option[value='0']").remove();
                        $("#" + rev_string + "_status_checked option[value='3']").remove();
                        $("#" + rev_string + "_status_checked option[value='1']").remove();
                        break;
                    case "3":
                        $("#" + rev_string + "_status_checked option[value='0']").remove();
                        $("#" + rev_string + "_status_checked option[value='1']").remove();
                        break;
                    case "4":
                        $("#" + rev_string + "_status_checked option[value='0']").remove();
                        $("#" + rev_string + "_status_checked option[value='3']").remove();
                        $("#" + rev_string + "_status_checked option[value='2']").remove();
                        $("#" + rev_string + "_status_checked option[value='1']").remove();
                        break;
                }

                $('#' + rev_string + '_adr').prop('disabled', false);
                $('#' + rev_string + '_send_adr').text('Zmień status').on('click', function() { ChangeStatusKZP(rev_string, rev_temp.status1); });
            }
        }

        if (user.id_kp == temp_user.id || (temp_user.general == 1 && temp_user.leader == 1 && (temp_user.branch == user.branch_kp))) {
            $('#' + rev_string + '_kp').prop('disabled', false);
            $('#' + rev_string + '_send_kp').on('click', function() { SendNoticeKP(rev_string, temp_user.id, result); });
        }

        $('#' + rev_string + '_recipients').change(
            function() {
                var temp_rev = this.id.split("_")[0];
                var int_rev = parseInt(temp_rev);
                var id_user = $("#" + this.id).val();

                ShowNotice(id_user, int_rev, temp_rev);
            });

        var first_rev = parseInt(rev_string);
        var first_user = $('#' + rev_string + '_recipients').val();
        ShowNotice(first_user, first_rev, rev_string);

        $('#' + rev_string + '_send_adr_added').on('click', function() { SendNotice(rev_string, temp_user.id, result); });
    }

    var owner = (rev_temp.auth_id == temp_user.id);
    var enabled = (rev_temp.date_checked_rec == null);
    var external_url = (owner && enabled) ? '' : '_read';

    var upload = ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'rm', 'rename', 'mkdir', 'upload', 'search', 'info', 'view', 'sort', 'desc'];
    var locked = ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'search', 'info', 'view', 'sort', 'desc'];

    var _commands = owner ? upload : locked;

    var target = rev_temp.main + "/" + rev_temp.folder;
    $('#elfinder_' + rev_string).elfinder({
        url: 'elfinder/php/connector.minimal' + external_url + '.php?folder=' + target + '&home=' + rev_string, // connector URL (REQUIRED)
        resizable: false,
        defaultView: 'list',
        reloadClearHistory: true,
        useBrowserHistory: false,
        commands: _commands
    });
}

function LoadAttachments(element, element2, rev_string, main, folder) 
{
    //poprawic
    var selectedUser = $('#' + rev_string + element).val();
    if(isNullOrWhitespace(selectedUser))
        return;
    
    var selectedText = $('#' + rev_string + element + ' option:selected').text();
    
    var _checkedDate = $('#' + rev_string + element2).val();
    alert(_checkedDate);
    
    var checkedElfinder = $('#elfinder_temp').elfinder('instance');
    if(typeof checkedElfinder !== 'undefined')
        $('#elfinder_temp').elfinder('instance').destroy();
    
    var owner = (selectedUser == temp_user.id);
    //var enabled = (rev_temp.date_checked_rec == null);
    //var external_url = (owner && enabled) ? '' : '_read';
    var external_url = owner ? '' : '_read';
    
    var upload = ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'rm', 'rename', 'mkdir', 'upload', 'search', 'info', 'view', 'sort', 'desc'];
    var locked = ['custom', 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'search', 'info', 'view', 'sort', 'desc'];

    var _commands = owner ? upload : locked;
    
    var target = main + "/" + folder + "_" + selectedUser;
    $('#elfinder_temp').elfinder({
        url : 'elfinder/php/connector.minimal' + external_url + '.php?folder=' + target + '&home=' + selectedText,  // connector URL (REQUIRED)
        resizable: false,
        defaultView: 'list',
        reloadClearHistory: true,
        useBrowserHistory: false,
        commands : _commands
    }).elfinder('instance');
    $('#myAttach').modal('show');
}

function ShowAllStatuses(rev_temp, rev_string) {
    var button = $('<button type="button" class="btn btn-default">');
    var new_elements = GetStatuses(rev_temp, button);
    if (new_elements.count > 0)
        $('#' + rev_string + '_statuses').append(new_elements.result);
}

function ShowAllAddress(rev_temp, rev_string) {
    $('#' + rev_string + '_recipients')[0].options.length = 0;
    var number_address = '2';
    ShowAddress(rev_temp.id_adr2, rev_temp.adr2, rev_temp.branch2, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr3, rev_temp.adr3, rev_temp.branch3, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr4, rev_temp.adr4, rev_temp.branch4, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr5, rev_temp.adr5, rev_temp.branch5, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr6, rev_temp.adr6, rev_temp.branch6, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr7, rev_temp.adr7, rev_temp.branch7, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr8, rev_temp.adr8, rev_temp.branch8, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr9, rev_temp.adr9, rev_temp.branch9, rev_string, number_address);

    number_address++;
    ShowAddress(rev_temp.id_adr10, rev_temp.adr10, rev_temp.branch10, rev_string, number_address);
}

function ShowNotice(id_user, int_rev, temp_rev) {
    var selected_id = getParameterByName('id');
    $.ajax({
        url: "_tools/get_notice.php",
        type: "POST",
        data: { key0: selected_id, key1: id_user, key2: int_rev },
        cache: false,
        dataType: "json",
        success: function(result) {
            $('#' + temp_rev + '_notice_adr_added').val(result.text);
            $('#' + temp_rev + '_date_received').val(result.date);

            if (result.status === null)
                result.status = 1;
            $('#' + temp_rev + '_status_checked_added').val(result.status);

            if (id_user == temp_user.id) {
                $('#' + temp_rev + '_adr_added').prop('disabled', false);
                if (result.date == null) {
                    $('#' + temp_rev + '_status_checked_added').prop('disabled', false);
                    $('#' + temp_rev + '_notice_adr_added').prop('disabled', false);
                    $('#' + temp_rev + '_send_adr_added').prop('disabled', false);
                } else {
                    $('#' + temp_rev + '_adr_added').prop('disabled', true);
                    $('#' + temp_rev + '_status_checked_added').prop('disabled', true);
                }
            } else {
                $('#' + temp_rev + '_adr_added').prop('disabled', true);
                $('#' + temp_rev + '_status_checked_added').prop('disabled', true);
            }
        }
    });
}

function ShowAddress(temp_id, temp_adr, temp_branch, rev_string, number_address) {
    var isnull = isNullOrWhitespace(temp_id);
    if (!isnull) {
        $('#' + rev_string + '_panel_adr_' + number_address).removeClass('hidden');
        $('#' + rev_string + '_id_users_' + number_address).val(temp_id);
        setTimeout(function() { $('#' + rev_string + '_branches_adr_' + number_address).val(temp_branch); }, 2000);
        setTimeout(function() { $('#' + rev_string + '_users_adr_' + number_address).val(temp_id); }, 2000);

        $('#' + rev_string + '_recipients').append($("<option></option>").attr("value", temp_id).text(temp_adr));
    }
}