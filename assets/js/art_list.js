var layer = layui.layer
var form = layui.form
var laypage = layui.laypage


var q = {
    pagenum: 1,
    pagesize: 2,
    cate_id: '',
    state: ''
}

template.defaults.imports.dataFormat = function (date) {
    var dt = new Date(date)
    var y = addZero(dt.getFullYear())
    var m = addZero(dt.getMonth() + 1)
    var d = addZero(dt.getDate())
    var hh = addZero(dt.getHours())
    var mm = addZero(dt.getMinutes())
    var ss = addZero(dt.getSeconds())
    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
}
// 补零函数
function addZero(n) {
    return n < 10 ? '0' + n : n
}
// 获取文章列表数据---封装函数
function initTable() {
    $.ajax({
        method: 'get',
        url: '/my/article/list',
        data: q,
        success: function (res) {

            if (res.status !== 0) {
                return layer.msg('获取列表数据失败')
            }
            // 渲染表格区域
            var htmlStr = template('tpl-table', res)
            $('tbody').html(htmlStr)
            // 渲染分页区域
            renderPage(res.total)
        }
    })
}
initTable()
// 渲染筛选区域的分类
function initCate() {
    $.ajax({
        method: 'get',
        url: '/my/article/cates',
        success: function (res) {
            if (res.status !== 0) {
                return layer.msg('获取列表失败')
            }
            var htmlStr = template('tpl-cate', res)
            $('[name=cate_id]').html(htmlStr)
            // 重新渲染layui的表单
            form.render()
        }
    })
}
initCate()
// 筛选
$('#form-search').on('submit', function (e) {
    e.preventDefault()
    var cate_id = $('[name=cate_id]').val()
    var state = $('[name=state]').val()
    // console.log(state,cate_id);
    q.cate_id = cate_id
    q.state = state
    initTable()
})
// 封装分页函数
function renderPage(total) {

    // console.log(total);
    laypage.render({

        layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],

        limits: [2, 3, 5, 10],

        elem: 'page',

        count: total,

        limit: q.pagesize,

        curr: q.pagenum,

        // 步骤：1、得到点击的哪一页 2、重新渲染表格
        // jump会生效的情况：1、点击触发jump
        //                  2、调用render函数渲染页面的时候
        jump: function (obj, first) {
            // console.log(obj.curr);
            q.pagenum = obj.curr
            q.pagesize = obj.limit
            // 调用函数渲染表格
            if (!first) {
                initTable()
            }
        }

    })
}
// 删除文章
$('tbody').on('click', '.btn-delete', function () {
    var len = $('.btn-delete').length;
    var id = $(this).attr('data-id')
    layer.confirm('是否确认删除?', { icon: 3, title: '提示' }, function (index) {
        $.ajax({
            method: 'get',
            url: '/my/article/delete/' + id,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('删除失败')
                }
                layer.msg('删除成功')
                // 如果当前页码中的数据都删除，则显示前一个页码中的数据
                // 判断当前页码中删除按钮的数量
                if (len === 1) {
                    // 如果是第一页页码还是显示1 如果不是则页码显示-1
                    q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
                }
                initTable()
            }
        })
        layer.close(index);
    });
})
