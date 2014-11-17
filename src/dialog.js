/**
 * 对话框组件
 * @author Gavin Cook
 * @Date 2014-01-06
 */

(function(){
    var dialogCache = {};

    var defaults = {
        title:"",
        buttons:[],
        callBack:{}
    };

    var methods  = {
        renderDialog:function(opts){

            var $contentHtml = this;
            var selector = this.selector;
            var $dialogDiv = $(document.createElement("div"));
            $dialogDiv.addClass("modal fade");

            var $modalDialog = $(document.createElement("div")).addClass("modal-dialog");
            var $modalContent = $(document.createElement("div")).addClass("modal-content");

            var $dialogHeader = $(document.createElement("div"));
            $dialogHeader.addClass("modal-header");

            var $closeBtn =  $(document.createElement("button"));
            $closeBtn.addClass("close").html("&times;");

            var $title = $(document.createElement("h3"));
            $title.html(opts.title);

            $dialogHeader.append($closeBtn).append($title);

            var $dialogContent = $(document.createElement("div"));
            $dialogContent.addClass("modal-body").append($contentHtml.show());

            var $btnGroup = $(document.createElement("div"));
            $btnGroup.addClass("modal-footer");

            $.each(opts.buttons,function(index,btn){
                var $btn = $(document.createElement("button"));
                $btn.addClass(btn.css||"btn btn-default").html(btn.text);
                $btn.bind("click",function(){
                    btn.click.call(dialogCache[selector],btn,opts);
                });
                $btnGroup.append($btn);
            });

            $contentHtml.removeClass("hide");
            $modalContent.append($dialogHeader).append($dialogContent).append($btnGroup);
            $modalDialog.append($modalContent);
            $dialogDiv.append($modalDialog);

            methods.bindEvents.call($dialogDiv,opts);
            dialogCache[selector] = $dialogDiv;
            $dialogDiv.modal("show");

            return $dialogDiv;
        },
        /**
         ** 绑定事件，如.close的关闭对话框
         **/
        bindEvents:function(opts){
            var $dialog = this;
            var selector  = dialog.selector;
            if(isCached(dialog.selector)){
                $dialog.off();
                $dialog.unbind();
            }

            $(".close",$dialog).bind("click",function(){
                $dialog.modal("hide");
            });

            $dialog.on('show.bs.modal', function (e) {
                if(opts.beforeShow){
                    opts.beforeShow.call(dialogCache[selector]);
                }
            });
            $dialog.on('shown.bs.modal', function (e) {
                if(opts.afterShown){
                    opts.afterShown.call(dialogCache[selector]);
                }
            });
            $dialog.on('hide.bs.modal', function (e) {
                if(opts.beforeClose){
                    opts.beforeClose.call(dialogCache[selector]);
                }
            });
            $dialog.on('hidden.bs.modal', function (e) {
                if(opts.afterClosed){
                    opts.afterClosed.call(dialogCache[selector]);
                }
            });
        }
    };

    /**
     * 对话框是否被缓存
     */
    function isCached(selector){
        for(var s in dialogCache){
            if(selector==s){
                return true;
            }
        }
        return false;
    }
    var dialog = function(selector,opts){
        var dialogInstance = this;
        var triggerStatusChange = function(){
            dialogCache[selector] = dialogInstance;
        };
        triggerStatusChange();//新建时，先存储到缓存，因为创建过程会使用到该对象

        this.opts = opts;
        this.selector = selector;
        this.renderDialog = function(){
            dialogInstance.$e = methods.renderDialog.call($(this),opts);
            triggerStatusChange();
            return dialogInstance;
        };
        this.close = function(){
            dialogInstance.$e.modal("hide");
            return dialogInstance;
        };
        this.reBindEvents = function(){
            methods.bindEvents.call(dialogInstance.$e,opts);
            triggerStatusChange();
            return dialogInstance;
        };
        this.show = function(){
            dialogInstance.$e.modal("show");
            return dialogInstance;
        };

        return dialogInstance;
    };

    $.fn.dialog=function(opts){
        if(typeof(opts)=="string"){
            if(opts=="close"){
                dialogCache[$(this).selector].close();
            }
        }else{
            opts=$.extend({},defaults,opts);
            var dialogSelector = $(this).selector;
            var newDialog = new dialog(dialogSelector,opts);
            newDialog.renderDialog.call($(this),opts);
        }
    };
})();