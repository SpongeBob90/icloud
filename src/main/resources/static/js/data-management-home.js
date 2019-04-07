var dirPathArr = [];
var pathNameArr = [];

$(document).ready(function () {
    $('#addFile').bind("click", addFile);
    $('#newFolder-modal .modal-footer .btn-info').bind("click", newFolder);
    $('.file-table-title input').bind("change", selectAndUnselectAll);
    $('body').bind("click", hidePopMenu);
    $('#delete-file-button').bind("click", deleteDocs);
    $('#renameDocs-modal .modal-footer .btn-info').bind("click", renameDocs);


    showUserDiv();
});

//监听页面复选框
function checkboxChanged() {
    var count = $("input[type='checkbox']:checked").length;
    if (count === 0) {
        $("#delete-div").hide();
        $("#rename-div").hide();
        $("#move-div").hide();
    } else if (count === 1) {
        $("#delete-div").show();
        $("#rename-div").show();
        $("#move-div").show();
    } else if (count > 1) {
        $("#delete-div").show();
        $("#move-div").show();
        $('#rename-div').hide();
    }
}


//删除文件/文件夹
function deleteDocs() {
    swal({
        title: "操作提示",      //弹出框的title
        text: "确定删除吗？",   //弹出框里面的提示文本
        type: "warning",        //弹出框类型
        showCancelButton: true, //是否显示取消按钮
        confirmButtonColor: "#DD6B55",//确定按钮颜色
        cancelButtonText: "取消",//取消按钮文本
        confirmButtonText: "是的，确定删除！",//确定按钮上面的文档
        closeOnConfirm: true
    }, function () {
        var selectedDocsArr = $("input[type='checkbox']:checked");
        var ids = "";
        if (selectedDocsArr.length > 0) {
            for (var i = 0; i < selectedDocsArr.length; i++) {
                var id = selectedDocsArr[i].value;
                if (id.length > 0) {
                    ids += selectedDocsArr[i].value + ",";
                }
            }
        }
        console.log(selectedDocsArr);
        ids = ids.substring(0, ids.length - 1);

        $.ajax({
            url: Config.baseUrl + "/docs/deleteDocs",
            type: "POST",
            data: {
                _method: "DELETE",
                "nowDirId": dirPathArr[dirPathArr.length - 1],
                ids: ids
            },
            dataType: "json",
            success: function (result) {
                if (result.code === 200) {
                    freshFileList(dirPathArr[dirPathArr.length - 1]);
                    $("#delete-div").hide();
                    $("#rename-div").hide();
                    $("#move-div").hide();
                }
            }
        });
    });
}

//重命名
function renameDocs() {
    var url = Config.baseUrl + "/docs/renameDocs";
    var params = {
        "docsId": $("input[type='checkbox']:checked")[0].value,
        "nowDirId": dirPathArr[dirPathArr.length - 1],
        "name": $("#new-name").val()
    };

    $.ajax({
        url: url,
        type: "POST",
        data: params,
        dataType: "json",
        success: function (result) {
            if (result.code === 200) {
                freshFileList(dirPathArr[dirPathArr.length - 1]);
            }
        }
    });
}

function hidePopMenu() {
    $("#context-menu").hide();
}

function selectAndUnselectAll() {
    var inputArr = $('.file-list input');
    for (var i = 0; i < inputArr.length; i++) {
        inputArr[i].checked = $('.file-table-title input').get(0).checked;
    }
}

function newFolder() {
    var url = Config.baseUrl + "/docs/addDir";
    var params = {
        "nowDirId": dirPathArr[dirPathArr.length - 1],
        "addDirName": $("#new-file-name").val()
    };
    $.ajax({
        url: url,
        type: "POST",
        data: params,
        dataType: "json",
        success: function (result) {
            if (result.code === 200) {
                freshFileList(dirPathArr[dirPathArr.length - 1]);
            }
        }
    });
    // $.get(url, params, function (result) {
    //     if (result.code === 200) {
    //         freshFileList(dirPathArr[dirPathArr.length - 1]);
    //     }
    // });
}

function addFile() {

}

function showUserDiv() {
    $("#guideTarget2").click(function () {
        $(".vip-info yp-header__avatarWrap__vip").show();
    });
}

function centerModals() {
    var $clone = $(this).clone().css('display', 'block').appendTo('body');
    var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
    top = top > 0 ? top : 0;
    $clone.remove();
    $(this).find('.modal-content').css("margin-top", top);
}

function freshFileList(dirId) {
    var url = Config.baseUrl + "/docs/getAllDocsByPid";
    var params = {
        "dirId": dirId
    };
    $.get(url, params, function (result) {
        if (result.code === 200) {
            if (result.data.docsList.length) {
                fillUpTable(result.data.docsList);
                $(".empty-wrap").hide();
                $(".table-wrap").show();
            } else {
                $(".table-wrap").hide();
                $(".empty-wrap").show();
            }
            if (dirPathArr[dirPathArr.length - 1] !== result.data.nowDir.id) {
                dirPathArr[dirPathArr.length] = result.data.nowDir.id;// 存储当前路径
                pathNameArr[result.data.nowDir.id] = result.data.nowDir.name;// 存储当前路径名
                freshDirPath();
            }
        }
    });
}

function freshDirPath() {
    if (dirPathArr.length === 1) {
        $('.dir-path-info').html("全部文件");
    } else if (dirPathArr.length > 1) {
        var path = "<a onclick='toPath(-1)'>返回上一级</a><span>|</span><a onclick='toPath(0)'>全部文件</a>";
        dirPathArr.forEach(function (value, index) {
            if (index > 0) {
                if (index < dirPathArr.length - 1) {
                    path += "<span>\></span><a onclick='toPath(" + index + ")'>" + pathNameArr[dirPathArr[index]] + "</a>";
                } else {
                    path += "<span>></span>" + pathNameArr[dirPathArr[index]];
                }
            }
        });
        $('.dir-path-info').html(path);
    }
}

function toPath(index) {
    if (index === -1) {
        dirPathArr.pop();
    } else {
        dirPathArr = dirPathArr.splice(0, index + 1);
    }
    freshDirPath();
    freshFileList(dirPathArr[dirPathArr.length - 1]);
}

function fillUpTable(docsList) {
    var rows = "";
    docsList.forEach(function (doc) {
        var floderIcon = "<i class='glyphicon glyphicon-folder-close' style='color: rgb(255,214,89);margin-right: 8px;'></i>";
        var fileIcon = "<i class='glyphicon glyphicon-file' style='color: #eee;margin-right: 8px;'></i>";
        rows += "<li style='font-size: 13px;'><ul>" +
            "<li class='column-1'><input type='checkbox' value='" + doc.id + "' onchange='checkboxChanged()'></li>" +
            "<li class='column-2 context' data-toggle='context' data-target='#context-menu'>" +
            "<span onclick='freshFileList(" + doc.id + ")'>" + (doc.type === 1 ? floderIcon : fileIcon) + doc.name + "</span>" +
            "</li>" +
            "<li class='column-3'>" + (doc.size ? doc.size : "-") + "</li>" +
            "<li class='column-4'>" + doc.createTime + "</li>" +
            "</ul></li>";
    });
    $(".file-table .file-list").html(rows);
    $(".context").contextmenu({
        target: '#context-menu',
        before: function () {
            // execute code before context menu if shown
            var target = $(event.srcElement).prev().find('input').get(0);
            if (!target.checked) {
                var inputArr = $('.column-1 input');
                for (var i = 0; i < inputArr.length; i++) {
                    inputArr[i].checked = false;
                }
                target.checked = true;
            }
        },
        onItem: function () {
            // execute on menu item selection
        },
        bindings:{
            "move":function (t) {
                console.log("move:" + t)
            },
            "rename":function (t) {
                console.log("rename:" + t)
            },
            "delete":function (t) {
                console.log("delete:" + t)
            }
        }
    });
    $(".file-list input").bind("click", function () {
        if (!$(this).get(0).checked) {
            $(".file-table-title input").get(0).checked = false;
        }
    });
}

function initTable() {
    var url = Config.baseUrl + "/docs/getAllDocsByPid";
    var params = {
        "dirId": 0
    };
    $.get(url, params, function (result) {
        if (result.code === 200) {
            freshFileList(result.data.nowDir.id);
        }
    });
}