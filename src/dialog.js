/**
 * 对话框组件
 * @author Gavin Cook
 * @Date 2014-01-06
 */
(function(){
	var defaults = {
		title:"",
		buttons:[]
	};

	var dialog  = {
		renderDialog:function(opts){
			var $contentHtml = this;
			var $dialogDiv = $(document.createElement("div"));
			$dialogDiv.addClass("modal hide fade");

			var $dialogHeader = $(document.createElement("div"));
			$dialogHeader.addClass("modal-header");

			var $closeBtn =  $(document.createElement("button"));
			$closeBtn.addClass("close").html("&times;");
			 
			var $title = $(document.createElement("h3"));
            $title.html(opts.title);

            $dialogHeader.append($closeBtn).append($title);

			var $dialogContent = $(document.createElement("div"));
			$dialogContent.addClass("modal-body").append($contentHtml);

			var $btnGroup = $(document.createElement("div"));
			$btnGroup.addClass("modal-footer");

			$.each(opts.buttons,function(index,btn){
				var $btn = $(document.createElement("button"));
				$btn.addClass(btn.class).html(btn.text);
				$btn.bind("click",function(){
					btn.click.call($dialogDiv);
				});
				$btnGroup.append($btn);
			});
			$dialogDiv.append($dialogHeader).append($dialogContent).append($btnGroup).modal("show");
		}
	};


	$.fn.dialog=function(opts){
		opts=$.extend({},defaults,opts);
		dialog.renderDialog.call($(this),opts);
	};
})();