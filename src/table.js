/**
 * ������,֧��ajax��ȡ����
 * �����:1��api�ĵ�
 * 	    2��pageSize��̬����
 * 		3��������Ż�
 * 		4�������ѡ��֧��
 * 		5����קʽѡ��
 * @author Gavin Cook
 * @Date 2012-08-25
 */
(function(){
	var defaults = {
		url:"",
		columns:[],
	    pageIndex:1,
		pageSize:10,
		params:{},
		dataFormat:''
	};

	var table  = {
		renderData:function(opts){
			var getData = table.getData.call(this,opts);
			var dfd = $.Deferred();
			getData.done(function(data){
				opts.currentDataSize = data.length;
				var dataHtml="<tbody>";
				$.each(data,function(index,columnData){
					dataHtml+="<tr>";
					$.each(opts.columns,function(index,columnDefinition){
					dataHtml+="<td>"+columnData[columnDefinition.name]+"</td>";
					});
					dataHtml+="</tr>";
				});
				 dataHtml+="</tbody>";
				dfd.resolve(dataHtml);
			});
			
			return dfd.promise();
		},
		renderHeader:function(opts){
			var header = "<thead><tr>";
			$.each(opts.columns,function(index,column){
				header+="<th>"+column.name+"</th>";
			});
			header+="</tr></thead>";
			return header;
		},
		renderTable:function(opts){
			var $container = this;
			var tableHtml = "<div class=\"datagrid\"><table class=\"table table-bordered table-hover\">";
			tableHtml+=table.renderHeader(opts);
			var renderTableDfd = $.Deferred();
			table.renderData(opts).done(function(tbody){
				tableHtml+=tbody;
				renderTableDfd.resolve();
			});
			
			$.when(renderTableDfd).done(function(){
				tableHtml+="</table>";
				tableHtml+=table.renderPagination(opts);
				tableHtml+=table.renderModal();
				tableHtml+="</div>";
				$container.html(tableHtml);
				tableCache[$container.selector] = $(tableHtml);
				table.bindEvents.call($container,opts);
			});
		},
		renderPagination:function(opts){
			var startIndex = (opts.pageIndex-1)*opts.pageSize+1;
			var endIndex = startIndex+opts.currentDataSize-1;
			var pageCount = Math.ceil(opts.total/opts.pageSize);
			opts.pageCount = pageCount||1;
			
			var paginationHtml = "<div class=\"grid-pagination\">"
		   +"<span class=\"pagination-btn\" action=\"first\"> <i class=\"icon-step-backward\"></i></span>"
		   +"<span class=\"pagination-btn\" action=\"prev\"> <i class=\"icon-play icon-prev\"></i></span>"
		   +"<input type=\"text\" name=\"currentPage\" class=\"input-small\" value=\"" 
		   +(opts.pageIndex||1)
		   +"\"/>/"
		   +"<span class=\"pagecount\">"
		   +pageCount
		   +"</span>"
		   +"<span class=\"pagination-btn\" action=\"next\"> <i class=\"icon-play\"></i></span>"
		   +"<span class=\"pagination-btn\" action=\"last\"> <i class=\"icon-step-forward\"></i></span>"
		   +"<span class=\"split\"></span>"
		   +"<span class=\"pagination-btn\" action=\"refresh\"> <i class=\"icon-refresh\"></i></span><!-- icon-spin-->"
		   +"<div class=\"data-info\">"
		   +"<span>��ǰ��ʾ</span>"
		   +"<span class=\"current-data-info\">"+startIndex
		   +"~"
		   +endIndex
		   +"</span>"
		   +"<span>��,��</span>"
		   +"<span clss=\"total\">" 
		   +opts.total
		   +"����¼</span>"
		   +"</div>"
		   +"</div>";
		   return paginationHtml;
		},
		refreshPagination:function(opts){
			var $pagination = $(".grid-pagination",this);
			var startIndex = (opts.pageIndex-1)*opts.pageSize+1;
			var endIndex = startIndex+opts.currentDataSize-1;
			var pageCount = Math.ceil(opts.total/opts.pageSize);
			opts.pageCount = pageCount||1;
			$pagination.find(":text[name='currentPage']").val(opts.pageIndex||1);
			$pagination.find(".pagecount").html(pageCount);
			$pagination.find(".current-data-info").html(startIndex+"~"+endIndex);
			$pagination.find(".total").html(opts.total);
		},
		renderModal:function(){
			return "<div class=\"modal-backdrop fade hide\"><span> <i class=\"icon-spinner icon-spin\"></i>Loading...</span></div>";
		},
		refresh:function(opts){
			var $container = this;
			var dfd = $.Deferred();
			var $refreshBtn = $(".pagination-btn .icon-refresh");
			$refreshBtn.toggleClass("icon-spin").closest(".datagrid").find(".modal-backdrop").toggleClass("hide").toggleClass("in");
			table.getData.call(this,opts).done(function(data){
				var dataHtml="";
				$.each(data,function(index,columnData){
					dataHtml+="<tr>";
					$.each(opts.columns,function(index,columnDefinition){
					dataHtml+="<td>"+columnData[columnDefinition.name]+"</td>";
					});
					dataHtml+="</tr>";
				});
				$("table tbody",$container).html(dataHtml);
				$refreshBtn.toggleClass("icon-spin").closest(".datagrid").find(".modal-backdrop").toggleClass("hide").toggleClass("in");
				dfd.resolve(dataHtml);
				table.refreshPagination.call($container,opts);
			});
			return dfd.promise();
		},
		getData:function(opts){
			var dfd = $.Deferred();
			if(opts.data){
				var data = opts.data;
				opts.total = data.total;
				if($.isFunction(opts.formatData)){
						data = opts.formatData.call(this,data);
				}
				dfd.resolve(data);
			}else{
				$.ajax({
					url:opts.url,
					type:'Get',
					dataType:'json',
					data:$.extend({},{pageIndex:opts.pageIndex,pageSize:opts.pageSize},opts.params)
				}).done(function(data){
					console.log(data);
					opts.total = data.total;
					if($.isFunction(opts.formatData)){
						data = opts.formatData.call(this,data);
					}
					dfd.resolve(data);
				}).fail(function(jqXHR, textStatus, errorThrown){
					dfd.reject(jqXHR);
				});
			}
			return dfd.promise();
		},
		bindEvents:function(opts){
			var $container = $(this);
			$(".pagination-btn",$container).click(function(event){
				switch($(this).attr("action")){
					case "refresh": table.refresh.call($container,opts);break;
					case "first"  : opts.pageIndex = 1;
								    table.refresh.call($container,opts);break;
					case "prev"   : if(opts.pageIndex-1>0){
										opts.pageIndex=opts.pageIndex-1;
									}else{
										opts.pageIndex = 1;
									}
					 				table.refresh.call($container,opts);break;
					case "next": 	if(opts.pageIndex+1>opts.pageCount){
										opts.pageIndex=opts.pageCount;
									}else{
										opts.pageIndex = opts.pageIndex+1;
									}
									table.refresh.call($container,opts);break;
					case "last":    opts.pageIndex=opts.pageCount;
						            table.refresh.call($container,opts);break;
				}
			});
			
		}
	};

	var tableCache = {};
	$.fn.table=function(opts){
		opts=$.extend({},defaults,opts);
		table.renderTable.call($(this),opts);
	};
})();