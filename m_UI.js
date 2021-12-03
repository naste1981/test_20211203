"use strict";

if(location.search.indexOf("DEV_MODE=Y") >= 0){
	localStorage.setItem("DEV_MODE", "Y");
}
var DEV_MODE = (localStorage.getItem("DEV_MODE") == "Y");
if(location.search.indexOf("APP_MODE=Y") >= 0){
	localStorage.setItem("APP_MODE", "Y");
}
var APP_MODE = (localStorage.getItem("APP_MODE") == "Y");
var IS_IE = (navigator.userAgent.indexOf("MSIE") >= 0 || typeof(window.document.documentMode) == "number");
var IS_IOS = false;

window.trace = function(){};
if(DEV_MODE){
	/*$(function(){
		$("head").append("<style>*:focus{box-shadow:inset 0 0 5px 0 orange;}</style>");
		$("body").addClass("dev_mode");
	});*/
	
	window.trace = function(){
		var pop = $("#tracer");
		if(pop.length == 0){
			var tmp = '<div id="tracer" style="position:fixed;bottom:0;right:0;width:200px;height:100px;padding:5px;border:1px solid grey;border-radius:5px;background-color:rgba(255,255,255,0.6);z-index:99999;">';
				tmp += '<div style="height:100%;overflow:auto;font-size:12px;line-height:15px;"></div>';
			tmp += '</div>';
			pop = $(tmp);
			$("body").append(pop);
		}
		var div = pop.find("div"),
			arr = Array.from(arguments);
		div.prepend('<span style="display:block;margin-top:2px;border-top:1px dashed #ccc;padding:2px;padding-bottom:0;color:black;">' + JSON.stringify(arr) + '</span>');
		var spans = div.find("span");
		if(spans.length > 20){
			spans.last().remove();
		}
	}
};
if(APP_MODE){
	if(typeof(overpass) == "undefined"){
		window.overpass = {
				global : {
					isApp : true
				}
		};
	}else{
		overpass.global.isApp = true;
	}
	if(typeof(fnAppScheme) == "undefined"){
		window.fnAppScheme = function(obj){
			if(DEV_MODE){
				trace("APP SCHEME: ", obj);
			}else{
				console.log("APP SCHEME: ", obj);
			}
		}
	}
	
	if(DEV_MODE){
		$("#header").remove();
	}
}

 // 순차적으로 증가하는 숫자 구하기
function getSerialNumber(){
	if(typeof(window.serialNum) == "undefined"){
		window.serialNum = 0;
	}
	
	return ++window.serialNum;
};

// 숫자 2자리 스트링 만들기
function getTwoDigit(n){
	if(n < 10){
		return "0" + n;
	}
	return "" + n;
};

// iOS 버전 구하기
function checkIOSVersion(){
    var agent = window.navigator.userAgent,
        start = agent.indexOf("OS ");
    if((agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1) && start > -1){
        return window.Number(agent.substr(start + 3, 3).replace("_", "."));
    }
    return 0;
}
IS_IOS = checkIOSVersion() > 10;

/**
 * 헤더 초기화
 */
function initHeader(){
	// 헤더 카테고리
	$("#header .titHead > a, #header .titHead .cateWrapL button.close").unbind("click.header").bind("click.header", function(){
		var a = $("#header .titHead > a"),
			aria = a.attr("aria-expanded"),
			body = $("body");
		
		if(aria === true || aria === "true"){
			a.attr("aria-expanded", false);
			//setBodyNoScrolling(false);
			body.removeClass("hidePopupDimm2");
		}else{
			a.attr("aria-expanded", true);
			//setBodyNoScrolling(true);
			body.addClass("hidePopupDimm2");
		}
	});
	
	// 서브헤더 카테고리
	$(".cateFixed .cateExtendArea button.btExtend").unbind("click.subCate").bind("click.subCate", function(e){
		var btn = $(e.currentTarget),
			aria = btn.attr("aria-expanded"),
			body = $("body"),
			list = $(".cateFixed .cateExtendArea .extendCateList"),
			$win = $(window);
		
		list.stop();
		if(aria === true || aria === "true"){
			//list.css("height", ($win.height() - 250));
			list.animate({height : 0}, {
				duration : 400,
				easing : "easeInSine",
				complete : function(){
					$(".cateFixed .cateExtendArea button.btExtend").attr("aria-expanded", false);
					//body.removeClass("hidePopupDimm");
					hidePopupDimm(false);
				}
			});
		}else{
			btn.attr("aria-expanded", true);
			//body.addClass("hidePopupDimm");
			hidePopupDimm(true);
			list.css("height", 0);
			var h = Math.min(($win.height() - 250), list.find(".cateListE").height());
			list.animate({height : h});
		}
	});
	$(".cateDimmed").unbind("click.subCate").bind("click.subCate", function(){
		$(".cateFixed .cateExtendArea button.btExtend").trigger("click.subCate");
	});
};// initHeader

/**
 * 독바 초기화
 */
function initDockBar(){
	if($("#asideWrap .dockArea").length == 0){ return; }
	
	var body = $("body"),
		$win = $(window),
		dock = $("#asideWrap .dockArea");
	/**
	 * 카테고리 초기화
	 */
	function initDockMenu(){
		var cateBtn = $("#asideWrap .dockArea .dockMenu .naviDraw button.cate"),
			cateWrap = $("#asideWrap .dockArea .dockMenu .naviDraw .cateWrap"),
			timer;
		
		function openCate(){
			clearTimeout(timer);
			cateWrap.css("display", "block");
			dock.addClass("cateOpen");
			//body.addClass("noscrolling");
			setBodyNoScrolling(true);
			timer = setTimeout(function(){
				cateBtn.attr("aria-expanded", true);
				updateSwipe();
			}, 1);
		};
		
		function closeCate(){
			clearTimeout(timer);
			cateBtn.attr("aria-expanded", false);
			dock.removeClass("cateOpen");
			//body.removeClass("noscrolling");
			setBodyNoScrolling(false);
			timer = setTimeout(function(){
				cateWrap.css("display", "none");
			}, 401);
		};
		
		// 공식스토어 스와이프 갱신
		function updateSwipe(){
			setTimeout(function(){
				if($(".swiperWrap.swiperDivi.swiperStore:visible").length > 0){
					try{
						$(".swiperWrap.swiperDivi.swiperStore").data("swiper").update();
					}catch(e){}
				}
			}, 1);
		};
		
		// 아코디언 자식 높이 구하기
		function getContentHeight(div){
			var h = 0,
				d4 = div.hasClass("dep4List"),
				c, t, b, p;
			
			div.children().each(function(idx, itm){
				if(d4 && ((idx % 2) != 0)){ return true; }
				
				c = $(itm);
				t = parseInt(c.css("margin-top"), 10);
				b = parseInt(c.css("margin-bottom"), 10);
				if(isNaN(t)){
					t = 0;
				}
				if(isNaN(b)){
					b = 0;
				}
				h += c.outerHeight() + t + b;
			});
			
			p = parseInt(div.data("padding"), 10);
			if(!isNaN(p)){
				h += p;
			}
			
			return h;
		};
		
		// 애니메이션 시 상위 아코디언 크기 조정
		function accordProgress(){
			var div = $(this),
				d3, d2;
			
			if(div.hasClass("dep4List")){
				d3 = div.closest(".dep3List");
				d3.height(getContentHeight(d3));
			}
			if(div.hasClass("dep3List") || div.hasClass("dep4List")){
				d2 = div.closest(".dep2Area");
				d2.height(getContentHeight(d2));
			}
		};
		
		$("#asideWrap .dockArea .dockMenu .naviDraw button.cate").unbind("click.dockbar").bind("click.dockbar", openCate);
		$("#asideWrap .dockArea .dockMenu .naviDraw .cateWrap button.cateClose").unbind("click.dockbar").bind("click.dockbar", closeCate);
		$("#tabScript a[aria-controls=tabCategory]").unbind("click.dockbar").bind("click.dockbar", updateSwipe);
		$(".asideWrap .dockArea .dockMenu .cateWrap .cateScroll a[aria-expanded]").each(function(idx, itm){
			var btn = $(itm),
				div = btn.next(),
				pad;
			
			// 3뎁스 css 재정의
			/*if(div.hasClass("dep4List")){
				div.find(">li").css({
					display : "block",
					width : "33.3%",
					float : "left"
				});
			}*/
			
			btn.attr("aria-expanded", false);
			
			// 패딩 초기화
			pad = parseInt(div.css("padding-bottom"), 10);
			if(isNaN(pad)){
				pad = 0;
			}
			if(pad > 0){
				div.data("padding", pad);
			}
			div.css({
				display : "block",
				height : 0,
				paddingBottom : 0,
				overflow : "hidden"
			});
		});
		$(".asideWrap .dockArea .dockMenu .cateWrap .cateScroll a[aria-expanded]").unbind("click.dockbar").bind("click.dockbar", function(e){
			var btn = $(e.currentTarget),
				aria = btn.attr("aria-expanded"),
				div = btn.next(),
				li, p;
			
			div.stop();
			if(aria === true || aria === "true"){
				btn.attr("aria-expanded", false);
				div.animate({
					height : 0
				},{
					duration:300,
					progress:accordProgress,
					complete:accordProgress
				});
			}else{
				btn.attr("aria-expanded", true);
				li = btn.parent();
				div.animate({
					height : getContentHeight(div)
				},{
					duration:300,
					progress:accordProgress,
					complete:accordProgress
				});
				li.siblings().find(">a[aria-expanded=true]").each(function(idx, itm){
					var btn = $(itm),
						div = btn.next();
						// 하위 아코디언 모두 닫기
						div.find("a[aria-expanded=true]").each(function(idx, itm){
							var btn = $(itm),
								div = btn.next();
							btn.attr("aria-expanded", false);
							div.stop().css("height", 0);
						});
						btn.trigger("click");
				});
			}
		});
	};
	
	/**
	 * 독바 펼침 내비 초기화
	 */
	function initDockNavi(){
		//var body = $("body"),
		//$win = $(window),
		//dock = $("#asideWrap .dockArea"),
		var navi = $("#asideWrap .dockArea .naviExtend button.navi"),
		close = navi.siblings(".extendArea").find("button.close"),
		touchStartY, touchStartX, moved;
		
		if(body.find(">.dimmed.dockBarDimmed").length == 0){
			body.append('<div class="dimmed dockBarDimmed"></div>');
		}
		
		navi.unbind("click.dockbar").bind("click.dockbar", function(){
			if(navi.attr("aria-expanded") === true || navi.attr("aria-expanded") === "true"){
				navi.attr("aria-expanded", false);
				navi.text("펼치기");
				body.removeClass("dockExpNaviOpened");
			}else{
				navi.attr("aria-expanded", true);
				navi.text("닫기");
				body.addClass("dockExpNaviOpened");
			}
		});
		
		body.find(">.dimmed.dockBarDimmed").unbind("click.dockbar").bind("click.dockbar", closeDockBar);
		close.unbind("click.dockbar").bind("click.dockbar", closeDockBar);
		//close.unbind("touchstart.dockbar").bind("touchstart.dockbar", touchStartDock);
		
		var ea = $("#asideWrap .dockArea .extendArea");
		if( ! ea.hasClass("dragDownWrapper")){
			ea.addClass("dragDownWrapper");
			close.addClass("dragDownClose");
			initDragDownArea();
			ea.find(".dragDownArea").unbind("click.dockbar").bind("click.dockbar", function(){
				close.trigger("click.dockbar");
			});
		}
		
		/**
		 * 독바 닫기
		 */
		function closeDockBar(){
			if(navi.attr("aria-expanded") === true || navi.attr("aria-expanded") === "true"){
				navi.trigger("click.dockbar");
			}
		};
		
		
		/**
		 * 타이틀 아래로 드래그 시에 팝업 닫기
		 */
		/*function touchStartDock(e){
			e.preventDefault();
			$win.bind("touchmove.dockbar", touchMoveDock);
			$win.bind("touchend.dockbar", touchEndDock);
			touchStartX = e.originalEvent.touches[0].screenX;
			touchStartY = e.originalEvent.touches[0].screenY;
			moved = false;
		};
		
		function touchMoveDock(e){
			var dx = e.originalEvent.touches[0].screenX - touchStartX,
			dy = e.originalEvent.touches[0].screenY - touchStartY;
			
			if(dy < -20){
				touchEndDock();
			}else if(dy > 50){
				touchEndDock();
				closeDockBar();
			}
			
			if(!moved && Math.sqrt(dx * dx + dy * dy) > 25){
				moved = true;
			}
		};
		
		function touchEndDock(e){
			$win.unbind("touchmove.dockbar", touchMoveDock);
			$win.unbind("touchend.dockbar", touchEndDock);
			if(!moved){
				closeDockBar();
			}
		};*/
	}
	
	if($("#asideWrap .dockArea .naviExtend").length > 0){
		initDockNavi();
	}
	if($("#asideWrap .dockArea .dockMenu").length > 0){
		initDockMenu();
	}
};// initDockBar



/**
 * 공통 스크롤 이벤트
 */
var GlobalScroll = function(){
	var me = this,
		listeners = [],
		count = 0,
		prevScroll = 0,
		$win = $(window);
	
	if(typeof(GlobalScroll.addListener) == "undefined"){
		//GlobalScroll.__proto__.addListener = function(func){
		GlobalScroll.addListener = function(func){
			listeners.push(func);
			checkListeners();
			scrollEvent();
		};
		
		//GlobalScroll.__proto__.removeListener = function(func){
		GlobalScroll.removeListener = function(func){
			$.each(listeners, function(idx, itm){
				if(itm === func){
					listeners.splice(idx, 1);
					return false;
				}
			});
			checkListeners();
		};
		
		GlobalScroll.scrollTo = function(t, d){
			if(typeof(d) != "number" || d < 0){
				d = 300;
			}
			$("html, body").stop().animate(
				{ scrollTop: t },
				{ duration : d }
			);
		};
		
		GlobalScroll.trigger = function(){
			scrollEvent();
		};
	}
	
	function checkListeners(){
		var len = listeners.length;
		if(count > 0 && len == 0){
			// stop
			$win.unbind("scroll.globalScroll");
			$win.unbind("resize.globalScroll orientationchange.globalScroll");
		}else if(count == 0 && len > 0){
			// start
			prevScroll = $win.scrollTop();
			$win.bind("scroll.globalScroll", scrollEvent);
			$win.bind("resize.globalScroll orientationchange.globalScroll", scrollEvent);
		}
		count = len;
	};
	
	function scrollEvent(){
		var scroll = $win.scrollTop(),
			docHeight = getDocHeight(),//(document.scrollingElement ? document.scrollingElement.scrollHeight : $(document).height()),
			winHeight = window.outerHeight,
			data = {
				maxScroll : Math.ceil(docHeight - winHeight),
				scroll : Math.ceil(scroll),
				delta : scroll - prevScroll,
				winHeight : winHeight,
				docHeight : docHeight
			};
		prevScroll = scroll;
		for(var i=0; i<count; i++){
			listeners[i](data);
		}
	};
	
	function getDocHeight(){
		return (document.scrollingElement ? document.scrollingElement.scrollHeight : $(document).height());
	};
	
	if(window.globalScrollInited !== true){
		window.globalScrollInited = true;
		
		var intervalCount = 0,
			intervalHeight, intervalID;
		intervalID = setInterval(function(){
			intervalCount++;
			if(typeof(intervalHeight) == "undefined"){
				intervalHeight = getDocHeight();
			}else{
				var h = getDocHeight();
				if(h != intervalHeight){
					try{
						scrollEvent();
					}catch(e){
						console.log(e)
					}
				}
				intervalHeight = h;
				if(intervalCount > 6){
					clearInterval(intervalID);
				}
			}
		}, 1000);
	}
	
	return me;
};// GlobalScroll

//var serverTime = "2020-10-14 13:07:05";
/**
 * 글로벌 타이머
 */
var GlobalClock = function(){
	
	if(typeof(GlobalClock.addListener) == "undefined"){
		GlobalClock.addListener = function(func){
			listeners.push(func);
			checkListeners();
		};
		
		GlobalClock.removeListener = function(func){
			$.each(listeners, function(idx, itm){
				if(itm === func){
					listeners.splice(idx, 1);
					return false;
				}
			});
			checkListeners();
		};
		
		GlobalClock.getDate = function(str){
			var date;
			
			try{
				str = str.replace(/-/g, "/");
				date = new Date(str);
				if(date == "Invalid Date"){
					date = new Date();
				}
			}catch(e){
				date = new Date();
			}
			
			return date;
		};
	}// init static function
	
	
	var me = this,
		listeners = [],
		count = 0,
		timer = -1,
		diff = 0,
		date;
	
	date = GlobalClock.getDate(window.serverTime);
	diff = date.getTime() - (new Date()).getTime();
	
	function checkListeners(){
		var len = listeners.length;
		if(count > 0 && len == 0){
			// stop
			clearInterval(timer);
		}else if(count == 0 && len > 0){
			// start
			timer = setInterval(tick, 100);
		}
		count = len;
		tick();
	};
	
	function tick(){
		var now = new Date();
		now.setMilliseconds(diff)
		for(var i=0; i<count; i++){
			listeners[i](now);
		}
	};
	
	return me;
};// GlobalClock


/**
 * 폼객체 초기화
 */
function initFormText(){
	// 텍스트 에어리어 오토 리사이즈
	var tf, me, offset, h;
	$("textarea").each(function(idx, itm){
		tf = $(itm);
		var mh = $(window).height() - 100;
		//tf.data("minHeight", tf.height());
		tf.unbind("keyup.autoresize").bind("keyup.autoresize", function(e){
			me = $(e.currentTarget);
			offset = parseInt(me.css("padding-top"), 10) + parseInt(me.css("padding-top"), 10);
			if(e.currentTarget.scrollHeight < mh){
				me.height(0);
				h = e.currentTarget.scrollHeight - offset;
				/*if(h < offset){
					h = offset;
				}*/
				me.height(h);
			}
			
			if(tf.parent().hasClass("chatingArea")){
				$('.chatBtms .chatMenuList').css('bottom', $('.chatContainer .chatBtms').outerHeight() + 'px');
			}
		});
	});
	// 텍스트 에어리어 오토 리사이즈
	
	// 텍스트필트 포커스 컨트롤
	$("textarea, input:not([type=radio]):not([type=checkbox]):not([type=file]):not([readonly])").unbind("focus.inpFocusAbs").bind("focus.inpFocusAbs", function(e){
		var txt = $(e.currentTarget),
			wrap = txt.closest(".formTextWrap");
		/*if(txt.closest(".reviewWrite").length > 0){
			txt.closest(".lCont").css({"height":"100%", "overflow":"auto"});
		}*/
		
		var pop = $(".layPop:visible").last();
		var sss = pop.find(".lCont").scrollTop();
		
		$("body").addClass("inpFocusAbs");
		
		if(typeof(sss) != "undefined"){
			pop.scrollTop(sss);
		}
		
		if(wrap.length > 0){
			wrap.addClass("on");
		}
		/**
		 * 20210607 
		 * 검색창 포커스 시 스크롤 이동 ios 만
		 */
		if(IS_IOS && txt.attr('type') == 'search'){
			var fixH = $('#fixedWrap').height() || 0;
			var heaH = $('#header').height() || 0
			var navH = $('#header').find('nav').height() || 0
			$('body, html').animate({scrollTop:txt.offset().top - fixH - navH - heaH});
		}
	});
	$("textarea, input:not([type=radio]):not([type=checkbox]):not([type=file]):not([readonly])").unbind("blur.inpFocusAbs").bind("blur.inpFocusAbs", function(e){
		var txt = $(e.currentTarget),
			wrap = txt.closest(".formTextWrap");
		/*if(txt.closest(".reviewWrite").length > 0){
			txt.closest(".lCont").css({"height":"", "overflow":""});
		}*/
		$("body").removeClass("inpFocusAbs");
		if(wrap.length > 0){
			wrap.removeClass("on");
		}
	});
	// 텍스트필트 포커스 컨트롤
	
	// 파일명 입력
	$("input[type=file]").unbind("change.filetype").bind("change.filetype", function(e){
		var file = e.currentTarget,
			span = $(file).siblings(".attachFile");
		try{
			span.text(file.files[0].name);
		}catch(e){
			span.text("");
		}
	});
	// 파일명 입력
	
	// 검색
	$(".frmSearch input").unbind("keyup.formSearch").bind("keyup.formSearch", function(e){
		var tf = $(e.currentTarget),
			txt = tf.val();
		if(txt.length > 0){
			tf.addClass("notEmpty");
		}else{
			tf.removeClass("notEmpty");
		}
	});
	$(".frmSearch input").trigger("keyup.formSearch");
	$(".frmSearch .btIco.icDel").unbind("click.formSearch").bind("click.formSearch", function(e){
		var btn = $(e.currentTarget),
			tf = btn.siblings("input");
		tf.val("").removeClass("notEmpty").focus();
	});
	// 검색
	
	// 넘버 스텝퍼
	$(".frmNum:not(.disableCommon) .btnCtrl").unbind("click.formnum").bind("click.formnum", function(e){
		var btn = $(e.currentTarget),
			txt = btn.siblings("input[type=number]"),
			num = Number(txt.val()),
			min = Number(txt.attr("min")),
			max = Number(txt.attr("max")),
			step = Number(txt.attr("step"));
		
		if(isNaN(num)){
			num = 0;
		}
		if(isNaN(min)){
			min = Number.NEGATIVE_INFINITY;
		}
		if(isNaN(max)){
			max = Number.POSITIVE_INFINITY;
		}
		if(isNaN(step)){
			step = 1;
		}
		
		if(btn.hasClass("btnDecr")){
			num = Math.max((num - step), min);
		}else{
			num = Math.min((num + step), max);
		}
		
		txt.val(num);
	});
	// 넘버 스텝퍼
};


/**
 * 공통 스크롤 이벤트
 */
function initScrollEvt(){
	var aside = $("#asideWrap"),
		btn = $("#asideWrap .btTop"),
		head = $("#header"),
		bann = $(".marketingBanner"),
		body = $("body"),
		h = $("#header").outerHeight(),
		type1 = head.hasClass("actionHd"),
		type2 = head.hasClass("actionHdType02"),
		hasDock = $("#asideWrap .dockArea").length > 0,
		fixer = {
			top : {
				target : null,
				enable : false
			},
			btm : {
				target : null,
				enable : false
			}
		},
		fth = 440,
		ft;
		
	if(typeof(h) == "undefined"){
		h = 104;
	}
	if(head.length == 0){
		h = 0;
	}
	
	btn.attr("onclick", "");
	btn.on("click", function(){
		GlobalScroll.scrollTo(0, 200);
		return false;
	});
	
	if($(".subHeaderFixed").length > 0){
		h += $(".subHeaderFixed").outerHeight();
	}

	$(".fixedWrap:visible").each(function(idx, itm){
		try{
			$(itm).height($(itm).children().outerHeight());	
		}catch(e){}
	});
	// 헤더 아래 고정 영역
	fixer.top.target = $(".fixedWrap:visible");
	fixer.top.enable = fixer.top.target.length > 0;
	// 하단 고정
	fixer.btm.target = $(".fixBottomWrap:visible");
	fixer.btm.enable = fixer.btm.target.length > 0;
		
	function showDock(){
		aside.removeClass("hideDock");
		$(".fixBottomWrap").removeClass("hideDock");
	};
	
	function hideDock(){
		aside.addClass("hideDock");
		$(".fixBottomWrap").addClass("hideDock");
	};
	
	
	GlobalScroll.addListener(function(data){
		var s = data.scroll,
			cnt = 0,
			cft, pft;
		// top btn
		if(s >= h){
			btn.addClass("on");
		}else{
			btn.removeClass("on");
		}
		/**
		 * 20210615
		 * 픽스 버그 수정
		 */
		var marketingBanner = $('.marketingBanner').height() || 0;
		// header
		if(s >= 50 + marketingBanner){
			// head.height(head.find('nav').height());
			head.addClass("headFixed");
			bann.addClass("scroll");
			if(type1){
				head.removeClass("actionHd");
			}
			if(type2){
				head.removeClass("actionHdType02");
			}
		}else{
			// head.height('');
			head.removeClass("headFixed");
			bann.removeClass("scroll");
			if(type1){
				head.addClass("actionHd");
			}
			if(type2){
				head.addClass("actionHdType02");
			}
		}
		
		// 헤더 아래 고정 영역
		fixer.top.target = $(".fixedWrap:visible");
		fixer.top.enable = fixer.top.target.length > 0;
		if(fixer.top.enable){
			ft = fixer.top.target;
			ft.each(function(){
				cft = $(this);
				if(cft.closest(".layPop").length > 0){ return true; }
				/**
				 * 20210616
				 * 픽스 버그 수정
				 */
				$('#header').each(function(){
					if($(this).hasClass('headFixed')){
						h = 56;
					};
				});
				if(cft.offset().top <= s + h){
					/**
					 * 20210615
					 * 20210623
					 * 픽스 버그 수정
					 */
					if(!cft.hasClass('fixed') && !cft.hasClass('rankingCate')){
						if(cft.hasClass('departureEdtListNum')){
							cft.css({'padding-top' : cft.outerHeight()+'px'});
						}else{
							cft.css({'padding-top' : cft.outerHeight()+'px', height : ''});
						}
					}
					cft.addClass("fixed");
					if(pft){
						pft.removeClass("fixed");
					}
					cnt++;
				}else{
					cft.removeClass("fixed");
					/**
					 * 20210615
					 * 20210623
					 * 픽스 버그 수정
					 */
					if(!cft.hasClass('fixed') && !cft.hasClass('rankingCate')){
						cft.css({'padding-top':'', height:'auto'});
					}
					
				}
				
				pft = cft;
				
				if(cnt > 0){
					head.addClass("noshade");
				}else{
					head.removeClass("noshade");
				}
			});
			
			/*if(ft.offset().top <= s + h){
				ft.addClass("fixed");
				head.addClass("noshade");
			}else{
				ft.removeClass("fixed");
				head.removeClass("noshade");
			}*/
		}
		
		// 하단 고정
		fixer.btm.target = $(".fixBottomWrap:visible");
		fixer.btm.enable = fixer.btm.target.length > 0;
		if(fixer.btm.enable){
			ft = fixer.btm.target;
			fth = Math.min(fth, ft.height());
			if(ft.is(":visible")){
				if(ft.offset().top + fth > data.scroll + data.winHeight){
					body.removeClass("noneFix");
				}else{
					body.addClass("noneFix");
				}
			}
		}
		
		// dock bar
		if(hasDock){
			if(IS_IE && data.delta == 0){
				// do nothing
			}else if(data.delta > 0){
				if(data.scroll >= data.maxScroll){
					showDock();
				}else if(data.scroll <= 0){
					showDock();
				}else{
					hideDock();
				}
			}else{
				showDock();
			}
		}
	});
};

/**
 * 탭 에어리어 초기화
 */
function initTabAreas(){
	var tabs = $(".tabArea:not(.inited)");
	if(tabs.length == 0){ return; }
	tabs.addClass("inited");
	
	function scrollIntoView(li, noani){
		if(li.length == 0){ return; }
		
		var ul = li.closest("ul"),
			wrap = li.closest(".tabArea"),
			w = wrap.width(),
			h = w / 2,
			mx = wrap.get(0).scrollWidth - w,
			x = Math.round(li.offset().left - ul.offset().left - h + li.width() / 2);

		if(x < 0){
			x = 0;
		}else if(x > mx){
			x = mx;
		}
		if(noani === true){
			wrap.stop(false).scrollLeft(x);
		}else{
			wrap.stop(false).animate({scrollLeft:x}, 300);
		}
	};
	
	function tabClicked(e){
		var a = $(e.currentTarget),
			li = a.parent(),
			ta = li.closest(".tabArea"),
			href = a.attr("href");
		
		if(a.hasClass("disabled") || li.hasClass("tabON")){ return false; }
		setTabIndex(li.index(), ta, "click");
		
		if(href == "#" || href == ""){
			return false;
		}
	};
	
	function setTabIndex(idx, ta, evtType){
		var li = ta.find(">ul>li").eq(idx),
			a = li.find(">a"),
			cl = li.siblings(".tabON"),
			ca = cl.find(">a"),
			targ, arr;
		
		if(li.hasClass("tabON")){ return false; }

		cl.removeClass("tabON");
		ca.attr("aria-selected", false);
		targ = ca.attr("aria-controls");
		if(targ){
			if(targ.indexOf("|") >= 0){
				arr = targ.split("|");
				$.each(arr, function(idx ,itm){
					$("#"+itm).removeClass("tabON");
				});
			}else{
				$("#"+targ).removeClass("tabON");
			}
		}
		
		li.addClass("tabON");
		a.attr("aria-selected", true);
		targ = a.attr("aria-controls");
		if(targ){
			if(targ.indexOf("|") >= 0){
				arr = targ.split("|");
				$.each(arr, function(idx ,itm){
					$("#"+itm).addClass("tabON");
					updateSwipers($("#"+itm));
				});
			}else{
				$("#"+targ).addClass("tabON");
				updateSwipers($("#"+targ));
			}
		}

		if(li.closest(".fixedWrap").length > 0){
			try{
				setTimeout(function(){
					var fix = li.closest(".fixedWrap");
					fix.height(fix.children().outerHeight());
				}, 100);
			}catch(e){}
		}
		
		scrollIntoView(li);
		
		if(evtType == "click"){
			var ts = ta.data("targetSwiper"),
				sww = $(ts),
				sw = sww.data("swiper");
			if(typeof(sw) != "undefined"){
				if(window.swiperVersion === 276){
					sw.swipeTo(li.index());
				}else{
					sw.slideToLoop(li.index());
				}
			}
		}
		
		if(!IS_IOS && li.closest(".layPop").length > 0){
			LayerPopup.resize();
		}
	};
	
	var tab;
	$.each(tabs, function(idx, itm){
		tab = $(itm);
		
		if(tab.css("position") == "static"){
			tab.css("position", "relative");
		}
		tab.find(">ul>li>a,>ul>li>button").bind("click.TabArea", tabClicked);
		tab.data("setTabIndex", setTabIndex);
		
		scrollIntoView(tab.find("li.tabON"), true);
	});
};

/**
 * 탭 초기화
 */
function initTabBasics(){
	// 탭 콘텐츠
	function tabClicked(e){
		var a = $(e.currentTarget),
			li = a.closest("li"),
			ta = li.closest(".tabBasic"),
			href = a.attr("href");
		
		var fn = a.data("validate");
		if(typeof(fn) == "function"){
			var rtn = fn(e);
			if(rtn === false){
				return false;
			}
		}
		
		if(a.hasClass("disabled") || li.hasClass("tabON")){ return false; }
		
		setTabIndex(li.index(), ta, "click");
		
		if(href == "#" || href == ""){
			return false;
		}
	};
	
	function setTabIndex(idx, ta, evtType){
		var li = ta.find(">li").eq(idx),
			a = li.find(">a"),
			cl = li.siblings(".tabON"),
			ca = cl.find("a"),
			ta = li.closest(".tabBasic"),
			targ, div;
		
		if(li.hasClass("tabON")){ return false; }
		
		cl.removeClass("tabON");
		ca.attr("aria-selected", false);
		targ = ca.attr("aria-controls");
		if(targ){
			$("#"+targ).removeClass("tabON");
			
			var vid = $("#"+targ).find(".videoPlayer.playing");
			if(vid > 0){
				vid.data("instance").stop();
			}
		}
		
		li.addClass("tabON");
		a.attr("aria-selected", true);
		targ = a.attr("aria-controls");
		if(targ){
			div = $("#"+targ);
			div.addClass("tabON");
			updateSwipers($("#"+targ));
			if(ta.hasClass("tabScrollTop")){
				var offset = $("#header").outerHeight() + ta.outerHeight();
				if($("#header").length == 0){
					offset = ta.outerHeight();
				}
				GlobalScroll.scrollTo(div.offset().top - offset);
			}
			GlobalScroll.trigger();
		}
		
		if(evtType == "click"){
			var ts = ta.data("targetSwiper"),
			sww = $(ts),
			sw = sww.data("swiper");
			if(typeof(sw) != "undefined"){
				if(window.swiperVersion === 276){
					sw.swipeTo(li.index());
				}else{
					sw.slideToLoop(li.index());
				}
			}
		}
		
		if(!IS_IOS && li.closest(".layPop").length > 0){
			LayerPopup.resize();
		}
		
		initTimeTracker();
	};
	
	
	var tabs = $(".tabBasic:not(.inited)");
	if(tabs.length > 0){
		tabs.addClass("inited");
		
		var tab, targ;
		$.each(tabs, function(idx, itm){
			tab = $(itm);
			
			if(tab.hasClass("tabToScroll")){
				initTabScroll(tab);
			}
			
			if(tab.closest(".tabArea").length > 0){return true;}
			
			tab.find(">li>a").bind("click.tabcontlist", tabClicked);
			tab.data("setTabIndex", setTabIndex);
		});// each
	}
	
	function initTabScroll(tab){
		var conts = [],
			skip = false,
			lis = tab.find(">li"),
			a, id, cont, t, s, curTab, li, si;
		//stab = tab;
		tab.find(">li>a").each(function(idx, itm){
			a = $(itm);
			id = a.attr("href");
			cont = $(id);
			a.data("cont", cont);
			conts.push(cont);
			a.bind("click", function(e){
				skip = true;
				setTimeout(function(){
					skip = false;
				}, 600);
				
				if($(e.currentTarget).data("cont").length > 0){
					t = $(e.currentTarget).data("cont").offset().top;
					$("html, body").stop().animate(
						{ scrollTop: t },
						{ duration : 600 }
					);
				}
			});
		});

		GlobalScroll.addListener(function(data){
			if(skip){ return; }
			
			id = 0;
			s = data.scroll + 10;
			$.each(conts, function(idx, itm){
				cont = $(itm);
				if(cont.length > 0 && s >= cont.offset().top){
					id = idx;
				}
			});
			if(id != curTab){
				curTab = id;
				li = lis.eq(id);
				si = li.siblings();
				li.addClass("tabON");
				li.find("a").attr("aria-selected", true);
				si.removeClass("tabON");
				si.find("a").attr("aria-selected", false);
			}
		});
	};
};

function initToggleContents(){
	var tg, targ, btn, cbtn, btns, idx, len;
	
	// 토글 컨텐츠
	$(".toggleContent").each(function(idx, itm){
		tg = $(itm);
		tg.find("button.toggleBt").unbind("click.toggleContent").bind("click.toggleContent", function(e){
			btn = $(e.currentTarget);
			//cbtn = btn.siblings(".toggleBt");
			if(btn.next(".toggleBt").length > 0){
				cbtn = btn.next(".toggleBt");
			}else{
				cbtn = btn.siblings(".toggleBt").eq(0);
			}
			
			btn.attr("aria-selected", false);
			btn.removeClass("on toggleON");
			targ = btn.attr("aria-controls");
			if(targ){
				$("#"+targ).removeClass("toggleON");
			}
			
			cbtn.attr("aria-selected", true);
			cbtn.addClass("on toggleON");
			targ = cbtn.attr("aria-controls");
			if(targ){
				$("#"+targ).addClass("toggleON");
			}
		});
	});
	
	// 상품 리스트 아이콘
	$(".toggle3Cont").each(function(idx, itm){
		tg = $(itm);
		tg.find("button.funcAcct").unbind("click.toggleContent").bind("click.toggleContent", function(e){
			btn = $(e.currentTarget);
			btns = btn.parent().find(".funcAcct");
			len = btns.length;
			idx = (btn.index() + 1) % len;
			
			btn.attr("aria-selected", false);
			try{
				$("#" + btn.attr("aria-controls")).removeClass("listON");
			}catch(e){}
			
			btn = btns.eq(idx);
			btn.attr("aria-selected", true);
			try{
				$("#" + btn.attr("aria-controls")).addClass("listON");
			}catch(e){}
		});
	});
	
	// 토글 클래스
	$(".toggleClassWrap .toggleClassBtn").unbind("click.toggleClass").bind("click.toggleClass", function(e){
		var btn = e.currentTarget,
			$btn = $(btn),
			wrap = $btn.closest(".toggleClassWrap"),
			cls = wrap.data("class"),
			targ = $(wrap.data("target"));
		if(typeof(cls) == "undefined"){
			cls = "on";
		}
		
		
		$btn.blur();
		wrap.toggleClass(cls);
		targ.toggleClass(cls);
		if(wrap.hasClass(cls)){
			var sw = wrap.find(".swiperWrap");
			if(sw.length > 0){
				sw.data("swiper").update();
			}
		}
		setTimeout(function(){
			btn.focus({preventScroll:true});
		}, 10);
	});
};

/**
 * 탭 고정 초기화
 */
/*function initTabFixed(){
	var tabs = $(".tabFixed:not(.inited)");
	if(tabs.length == 0){ return; }
	tabs.addClass("inited");
	
	$(window).unbind("scroll.tabFixed").bind("scroll.tabFixed", function(){
		var tab, fix;
		$.each(tabs, function(idx, itm){
			tab = $(itm);
			if(tab.get(0).getBoundingClientRect().top <= $("#header").height()){
				fix = tab;
			}
		});
		
		if(typeof(fix) == "undefined"){
			tabs.filter(".fixed").removeClass("fixed");
		}else{
			tabs.filter(".fixed").not(fix).removeClass("fixed");
			fix.addClass("fixed");
		}
	});
	
	$(window).trigger("scroll.tabFixed");
};*/

/**
 * 툴팁 초기화
 */
function initToolTips(){
	var tips = $(".tipWrap:not(.inited)");
	if(tips.length == 0){ return; }
	tips.addClass("inited");

	var win = $(window),
		tip, btn, cnt, dim, st, tx, wh, lc, pst, ttp;
	tips.each(function(idx, itm){
		tip = $(itm);
		btn = tip.find(".btTip");
		cnt = tip.find(".tipCont");
		dim = tip.find(".dimmed");
		btn.data("cnt", cnt);
		cnt.data("btn", btn);
		
		btn.bind("click.tooltip", function(e){
			var tip = $(e.currentTarget).closest(".tipWrap");
			if(tip.hasClass("on")){
				tip.removeClass("on");
				//$("body").removeClass("hidePopupDimm tooltipShow");
								
				var pop = tip.closest(".layPop");
				if(pop.length > 0){
					var sss = pop.scrollTop();
					
					$("body").removeClass("tooltipShow");
					//$("body").removeClass("hidePopupDimm tooltipShow");
					//hidePopupDimm(false);
					
					if(typeof(sss) != "undefined"){
						tip.closest(".lCont").scrollTop(sss);
					}
				}else{
					$("body").removeClass("tooltipShow");
					//$("body").removeClass("hidePopupDimm tooltipShow");
					//hidePopupDimm(false);
					$('#container').each(function(){
						$(this).css({marginTop:'',paddingTop:''});
					});
				}
				
			}else{
				$(".tipWrap.on .closeT").trigger("click.tooltip");// 열려있는 툴팁 닫기
				tip.addClass("on");
				pst = tip.closest('.layCont').scrollTop();
				ttp = tip.find(".tipCont").offset().top;
				var pop = tip.closest(".layPop");
				if(pop.length > 0){
					var sss = pop.find(".lCont").scrollTop();

					//$("body").addClass("hidePopupDimm tooltipShow");
					$("body").addClass("tooltipShow");
					//hidePopupDimm(true);
					
					if(typeof(sss) != "undefined"){
						pop.scrollTop(sss);
					}

					if( $("body").hasClass("cartBody")){
						hidePopupDimm(false);
					}
				}else{
					//$("body").addClass("hidePopupDimm tooltipShow");
					$("body").addClass("tooltipShow");
					//hidePopupDimm(true);
					//$('#container').each(function(){
					//	$(this).css({marginTop:0,paddingTop:'56px'});
					//});
				}
				
				
				lc = tip.closest(".lCont");
				cnt = tip.find(".tipCont");
				if(lc.length > 0){
					st = lc.scrollTop();
					wh = lc.height();
					tx = cnt.offset().top - lc.offset().top + cnt.outerHeight();
					if(lc.hasClass("benefitCustomizing")){
						st = pst;
						lc.scrollTop(st);
						return false;
					}
					if(tx > wh){
						lc.scrollTop(st + tx - wh);
					}
				}else{
					st = win.scrollTop();
					wh = win.height();
					tx = cnt.offset().top + cnt.outerHeight();
					if(tx > wh + st - 100){
						GlobalScroll.scrollTo(tx - wh + 100);
					}
				}
				cnt.css('z-index','999999');
				//$("body").addClass("hidePopupDimm tooltipShow");
			}
		});
		cnt.find(".closeT").bind("click.tooltip", function(e){
			$(e.currentTarget).closest(".tipArea").find(".btTip").trigger("click.tooltip");
		});
		dim.bind("click.tooltip", function(e){
			$(e.currentTarget).closest(".tipArea").find(".btTip").trigger("click.tooltip");
		});
		
		/*cnt.bind("touchmove.tooltip", function(e){
			e.preventDefault();
		});*/
	});
};

//// 마이페이지 tooltip dimmed 제어
$('.myPageContents .accordianList .tipArea .btTip').click(function(e){
	$('.myPageContents').addClass('myPageDimmedOn');
	//$('body').append('<div class="myPageDimmed"></div>');
	//$(this).parent('.tipArea').append('<div class="myPageDimmed"></div>');
	//var target = $(e.target);
	//var p = $(target).offset();
	//var tipContTop = p.top;
	//var	y = e.clientY;
	//$('.myPageContents.myPageDimmedOn .accordianList .tipCont').css({"top" : y});
})
$('.tipArea .closeT').click(function(){
	$('.myPageContents').removeClass('myPageDimmedOn');
	//$('.myPageDimmed').detach();
})

/**
 * 아코디온 초기화
 */
function initAccordions(){
	var accordion = $(".accordianList:not(.inited)");
	var $win = $(window);
	if(accordion.length == 0){ return; }
	accordion.addClass("inited");
	
	// 버튼 클릭 이벤트 설정
	accordion.find(".toggleAction > a[role=button]").unbind("click.accordion").bind("click.accordion", function(e){
		var btn = $(e.currentTarget),
			li = btn.closest(".toggleAction"),
			ul = btn.closest(".accordianList"),
			cl = ul.hasClass("closeOther"),
			con = btn.siblings(".accordCont");
		if(btn.attr("aria-expanded") === true || btn.attr("aria-expanded") === "true"){
			btn.attr("aria-expanded", false);
			btn.children(".btnMors").show();
		}else{
			btn.attr("aria-expanded", true);
			btn.children(".btnMors").hide();
			if(cl){
				li.siblings(".toggleAction").find("> a[role=button]").attr("aria-expanded", false);
			}
			try{
				updateSwipers(con);
				//var sw = btn.siblings(".accordCont").find(".swiperWrap").data("swiper");
				//sw.update();
			}catch(e){}
			
			var st = ul.data("scrollTop");
			if(typeof(st) == "number"){
				GlobalScroll.scrollTo(li.offset().top - st, 250);
			}

			/**
			 * 20210609
			 * 아코디언 오픈 시 스크롤 이동 추가
			 */
			var conT = con.offset().top;
			var conB = conT + con.outerHeight(true);
			var headerH = $('#header').height() || 0;
			var docH = $('.dockArea').height() || 0;
			if(conB + docH > $win.scrollTop()+$win.height()){
				if (con.offset().top < conB - $win.height() + headerH) {
					$('body,html').stop().animate({scrollTop:conT - headerH},300);
				} else {
					$('body,html').stop().animate({scrollTop:conB + docH - $win.height()},300);
				}
			}
		}
		
		if(ul.find(".toggleAction > a[role=button][aria-expanded=true]").length > 0){
			ul.addClass("accordianON");
		}else{
			ul.removeClass("accordianON");
		}
		
		return false;
	});
};


/**
 * 레이어 팝업 클래스
 */
var posY;

var LayerPopup = function(){
	var template = '<section id="layer_alert_popup" class="layPop layPopMid" tabindex="0">';
		template += '<h2 class="titLay"></h2>';
		template += '<div class="layCont">';
			template += '<div class="lCont" tabindex="0"></div>';
			template += '<div class="btnBtm">';
				template += '<div class="btnArea">';
					template += '<button type="button" class="btnSSG btnL btnCancel" data-action="cancel">취소</button>';
					template += '<button type="button" class="btnSSG btnL action btnOk" data-action="ok">확인</button>';
				template += '</div>';
			template += '</div>';
		template += '</div>';
		template += '<button type="button" class="closeL" data-action="close">닫기</button>';
	template += '</section>';
	
	var aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : aniComplete
		},
		$win = $(window),
		container, dimmed, alertPopup, alertContent, alertTitle, alertCancel, alertOk;
	
	/**
	 * 레이어 팝업 초기화
	 */
	function init(){
		/**
		 * 20210607
		 * 인라인에 마크업 되어 있는 팝업 가져오기
		 */
		LayerPopup.inline = $(document).find('.layPop');
		// 팝업 호출 버튼 초기화
		LayerPopup.initButtons();
		
		if($("#dummyVHLayer").length <= 0){
			$("body").append('<div style="position:fixed;top:0;left:-100px;bottom:0;width:0;" id="dummyVHLayer"></div>');
		}
	};
	
	/**
	 * 팝업 컨테이너 초기화
	 */
	function initContainer(){
		if(container instanceof jQuery){ return; }
		
		container = $("#layerPopupContainer");
		if(container.length == 0){
			container = $('<div id="layerPopupContainer"><div class="dimmed"></div></div>');
			$("body").append(container);
		}
		dimmed = container.find(".dimmed");
		if(dimmed.length == 0){
			dimmed = $('<div class="dimmed"></div>');
			container.append(dimmed);
		}
		dimmed.css("z-index", 99999);
		dimmed.bind("click.layerPopup", closePopup);
	};
	
	/**
	 * 버튼 클릭하여 팝업 로드하기
	 */
	function popupBtnClick(e){
		var a = $(e.currentTarget);
		if(a.closest(".app").length > 0){ return false; }
		
		if(typeof(a.data("path")) != "undefined"){
			LayerPopup.load(a.data("path"));
		}
		
	};
	
	/**
	 * 팝업 HTML 로드 성공
	 * @param {string}	data	- 로드된 HTML 텍스트
	 * @param {string}	url		- 로드한 팝업의 URL
	 */
	function loadSuccess(data, url, obj){
		var idx;
		idx = data.indexOf("<!-- layer popup end -->");
		if(idx >= 0){
			data = data.substr(0, idx);
		}
		idx = data.indexOf("<!-- layer popup start -->");
		if(idx >= 0){
			data = data.substr(idx) + 26;
		}
		
		initContainer();
		
		var pop = $(data).filter(".layPop");
		if(typeof(obj) != "undefined"){
			pop.data("remove", true);
		}else{
			getPopup(url, obj).popup = pop;
		}
		//pop.data("data", obj);
		
		//dimmed.before(pop);
		//getPopup(url).popup = pop;
		
		pop.find(".btnArea button, .optionArea .btnGroup button, button.closeL").unbind("click.layerPopup").bind("click.layerPopup", closePopup);
		//initTouchArea(pop);
		openPopup(pop);
		initNestedForms(pop);
		
		if(typeof(obj) != "undefined"){
			pop.data("object", obj);
			
			// 콜백함수 있으면 호출하기
			if(typeof(obj.success) == "function"){
				obj.success(pop);
			}
		}
	};
	
	/**
	 * 팝업 로드 에러
	 */
	function loadError(){
		//console.log("LayerPopup load Error");
	};
	
	/**
	 * 이미 로드된 url 인지 확인
	 * @param {string}	url	- 로드할 팝업의 URL
	 */
	function getPopup(url, obj){
		if(typeof(obj) != "undefined"){ return; }
		
		var len = LayerPopup.popupList.length,
			i, pop;
		
		for(i=0; i<len; i++){
			pop = LayerPopup.popupList[i];
			if(pop.url == url){
				return pop;
			}
		}
		
		return;
	};
	
	/**
	 * 애니메이션 종료 이벤트
	 */
	function aniComplete(){
		var pop = $(this);
		if(!pop.hasClass("on")){
			pop.css("display", "none");
			if(pop.data("remove") === true){
				removePopup(pop);
			}
			//GlobalScroll.removeListener(resizePopCont);
		}else{
			//if(pop.hasClass("layPopBtm")){
				//GlobalScroll.removeListener(resizePopCont);
				//GlobalScroll.addListener(resizePopCont);
			//}
		}
	};
	
	function resizePopCont(data){
		var pop = container.find(".layPop.on").last(),
			con = pop.find(".layCont"),
			listPaging = con.find(".btnBtm .listPaging"),
			h = 143,
			mh = pop.data("minHeight"),
			full = pop.hasClass("layPopFull"),
			mid = pop.hasClass("layPopMid"),
			ft = con.siblings(".filterTab"),
			hh, ph, pt, dh;
		
		var ip = pop.find("input[type=text]");

		/*if(full && IS_IOS){
			return;
		}*/

		if(listPaging.length){
			listPaging.closest(".btnBtm").addClass("isPaging");
		}
		
		if(pop.hasClass("btmType02")){
			//h = 193;
			h = pop.find(".titLay").outerHeight() + 105;
		}
		dh = $("#dummyVHLayer").height();
		hh = dh - h;
		if(ft.length > 0){
			hh -= ft.outerHeight();
		}
		
		if(IS_IOS){
			if(full){
				if(pop.attr("id") == "siteAddInfoLayer"){
					setTimeout(function(){
						var lc = pop.find(".layCont");
						if(lc.scrollTop() == 0){
							lc.scrollTop(1);
						}else{
							lc.scrollTop(0);
						}
					}, 100);
				}
			}else{
				if(typeof(mh) != "number"){
					mh = Math.round(hh * 0.8);
					con.data("minHeight", mh);
				}
				
				if(hh < mh){
					con.css("height", mh);
					hh = mh;
				}else{
					con.css("height", "");
				}
				if(!full){
					if(con.find(".cm_laypop").length > 0){
						// 신구단 필터 레이어 예외처리
						var ft = con.siblings(".filterTab.filtpotion");
						if(ft.length > 0){
							con.attr("style", "max-height:" + (hh - ft.outerHeight()) + "px !important");
						}else{
							con.css("max-height", hh);
						}
					}else{
						if (con.closest('.profileRegister').length) {
							hh = dh + h - $(window).height() * 0.1;
							var registStep = con.find('.registStep');
							var h = con.find('.stepInfo').offset().top - registStep.offset().top;
							if(h > 0){
								registStep.css({paddingBottom:0,height:h});
							}
						}
						con.css("max-height", hh);
					}
				}
			}
		}else{
			setTimeout(function(){
				if(con.length == 0){ return; }
				
				mh = con.data("minHeight");
				if(typeof(mh) != "number"){
					//mh = con.height();
					var tit = pop.find(".titLay"),
						tith = tit.outerHeight(),
						mgt = parseInt(tit.css("marginTop"), 10),
						mgb = parseInt(tit.css("marginBottom"), 10);
					if(!isNaN(mgt)){
						tith += mgt;
					}
					if(!isNaN(mgb)){
						tith += mgb;
					}
					
					mh = pop.outerHeight() - tith;
					if(ft.length > 0){
						mh -= ft.outerHeight();
					}
					con.data("minHeight", mh);
					con.css("height", mh);
				}else{
					con.css("height", "");
					
					var tit = pop.find(".titLay"),
						tith = tit.outerHeight(),
						mgt = parseInt(tit.css("marginTop"), 10),
						mgb = parseInt(tit.css("marginBottom"), 10);
					if(!isNaN(mgt)){
						tith += mgt;
					}
					if(!isNaN(mgb)){
						tith += mgb;
					}
					
					mh = pop.outerHeight() - tith;
					if(ft.length > 0){
						mh -= ft.outerHeight();
					}
					//con.data("minHeight", mh);
					con.css("height", mh);
				}
				
				//con.css("max-height", "100000px");
				/*if(hh < mh){
					con.css("height", mh);
				}else{
					con.css("height", "");
				}*/
				
				if(mid){
					ph = pop.data("minHeight");
					if(typeof(ph) != "number"){
						ph = pop.outerHeight();
						pop.data("minHeight", ph);
					}

					pt = pop.data("topPosi");
					if(typeof(pt) != "number"){
						pt = (dh - ph) / 2;
						pop.data("topPosi", pt);
					}
					
					pt = (dh - ph) / 2;
					if(pt < 20){
						pt = 20;
					}
					
					pop.css({
						//"max-height": ph,
						"height": ph
						//"transform": "translateY(0)",
						//"transition": "none",
						//"top" : pt
					});
				}
			}, 100);
		}
		
	};
	
	/**
	 * 팝업 열기
	 */
	function openPopup(pop){
		//if(pop.hasClass("dragDownWrapper")){
		if(pop.hasClass("layPopBtm") || pop.hasClass("exitPopup")){
			pop.stop(true);
			pop.css({"display":"block", "bottom":"-100%", "-webkit-transition":"none", "transition":"none"});
			setTimeout(function(){
				pop.animate({"bottom":"0"}, aniProp);
			}, 1);
		}
		pop.addClass("on");

		GlobalScroll.removeListener(resizePopCont);
		GlobalScroll.addListener(resizePopCont);
		setTimeout(resizePopCont, 200);
		setTimeout(resizePopCont, 1000);
		
		container.append(dimmed);
		container.append(pop);
		
		pop.data("focus", $(":focus"));
		//$("body").addClass("noscrolling");
		setBodyNoScrolling(true);
		//pop.data("overflow", $("body").css("overflow"));
		//$("body").css("overflow", "hidden");
		//pop.find(".btnBtm .btnArea button:first-child").focus();
		if(typeof(pop.attr("tabindex")) == "undefined"){
			pop.attr("tabindex", 0);
		}
		setTimeout(function(){
			pop.focus();
		}, 10);
		
		checkMultiPopup();
		initNestedForms(pop);
		
		// 상품상세 이미지보기
		var det = pop.find(".layCont.picDetail");
		var dh = 0;
		if(det.length > 0){
			det.find('.swiper-slide').css('height','initial');
			// det.find(".swiper-slide img").bind("load", function(e){
			// 	var ih = $(e.currentTarget).height();
			// 	if(ih > dh){
			// 		dh = ih;
			// 		det.find(".swiper-slide").css("min-height", dh);
			// 	}
			// });
		}
		
		// 공식스토어 메인 비디오 팝업
		if(pop.hasClass("btqmainVideo") && pop.find(".lCont > iframe").length > 0){
			var ifr = pop.find(".lCont > iframe"),
				lc = pop.find(".lCont"),
				h = Math.round(ifr.width() * 0.57),
				t = Math.round((lc.height() - h) / 2);
			if(t < 0){
				t = 0;
			}
			ifr.css({
				"height" : h,
				"transform" : "translate(0, " + t + "px)"
			});
			lc.css({
				"padding-left" : 0,
				"padding-right" : 0
			});
		}

		// 메인 공지 팝업, 지점 공지 팝업 노출시 메인 빅배너 슬라이드 자동 재생 멈춤
		if(pop.hasClass("notiPop")){
			$(function(){
				var mainBigBanner = $(".swiperWrap.visualBanner"),
					btnStop = mainBigBanner.find(".btnStop");
				function bigBannerStop(){
					btnStop.trigger("click");
				}
				bigBannerStop();
			})
		}
	};
	
	/**
	 * 팝업 닫기
	 */
	function closePopup(e, param){
		var btn = $(e.currentTarget),
			pop = btn.closest(".layPop"),
			delay = 0;
		
		GlobalScroll.removeListener(resizePopCont);
		
		// 딤드 클릭한 경우, 열린 팝업 레이어 할당 
		if(btn.hasClass("dimmed")){
			pop = btn.siblings(":visible").last();
		}
		if(pop.is(':animated')){
			return false;
		}
		/**
		 * 20210607
		 * 닫은 팝업 가져오기
		 * 인라인 팝업 제어 시 필요
		 */
		LayerPopup.thisClose = pop;
		// 확인/취소 버튼에 noAutoClose 클래스가 있으면 어떤 동작으로도 팝업 닫을 수 없음
		// LayerPopup.close() 함수로만 닫을 수 있음
		/*if(param !== "forceClose" && pop.find(".noAutoClose").length > 0){
			return false;
		}*/
		// 개발 요청으로 클릭한 버튼에 noAutoClose 있을때만 닫기 안함
		if(param !== "forceClose"){
			if(btn.hasClass("noAutoClose")){
				return false;
			}
			// dimmed 클릭 시 닫기 버튼 noAutoClose 체크 해서 안닫기
			// 닫기 버튼 click 트리거
			if(btn.hasClass("dimmed")){
				var cbtn = pop.find(".noAutoClose");
				if(cbtn.length > 0){
					// 일단 사용하지 않도록 개발 요청
					//cbtn.eq(0).trigger("click");
					return false;
				}
			}
		}

		var cbo = pop.data("object");
		
		if(pop.hasClass("layPopBtm") || pop.hasClass("exitPopup")){
			pop.stop(true).css({"display":"block", "bottom":"0"}).animate({"bottom":"-100%"}, aniProp);
			delay = 410;
		}
		pop.removeClass("on");
		setBodyNoScrolling(false);
		
		var focus = pop.data("focus");
		if(focus && focus.length > 0){
			focus.focus();
		}
		
		var fi = pop.find("input:focus");
		if(fi.length > 0){
			fi.blur();
		}
		
		// 열린 툴팁 닫기
		pop.find(".tipWrap.on .tipCont .closeT").trigger("click.tooltip");
		
		if(!pop.hasClass("dragDownWrapper") && pop.data("remove") === true){
			removePopup(pop);
		}
		
		// 콜백함수 있으면 호출하기
		if(typeof(cbo) != "undefined" && typeof(cbo.close) == "function"){
			cbo.close(pop);
		}

		// 메인 공지 팝업, 지점 공지 팝업 닫을 때 메인 빅배너 슬라이드 자동 재생
		if(pop.hasClass("notiPop")){
			$(function(){
				var mainBigBanner = $(".swiperWrap.visualBanner"),
					btnPlay = mainBigBanner.find(".btnPlay");
				function bigBannerPlay(){
					btnPlay.trigger("click");
				}
				bigBannerPlay();
			})
		}
		
		setTimeout(checkMultiPopup, delay);
	};
	
	/**
	 * 팝업 제거하기
	 */
	function removePopup(pop){
		// 자식 팝업들 삭제
		var arr = pop.data("children");
		if($.isArray(arr)){
			var popup, id, len, i, p;
			$.each(arr, function(idx, itm){
				popup = $(itm);
				id = popup.attr("id");
				len = LayerPopup.popupList.length;
				for(i=0; i<len; i++){
					p = LayerPopup.popupList[i];
					if(p.url == id){
						LayerPopup.popupList.splice(idx, 1);
						break;
					}
				}
				popup.remove();
			});
		}
		
		pop.remove();
		/*var index = -1;
		$.each(LayerPopup.popupList, function(idx, itm){
			try{
				if(itm.popup.get(0) == pop.get(0)){
					index = idx;
				}
			}catch(e){}
		});
		
		if(index >= 0){
			LayerPopup.popupList.splice(index, 1);
		}*/
	};// removePopup
	
	/**
	 * 다중 팝업인 경우 마지막 팝업을 상위로 노출하기
	 */
	function checkMultiPopup(){
		/*var pop2 = container.find(".layPop.on ~ .layPop.on");
		if(pop2.length > 0){
			dimmed.attr("style", "z-index:9999");
			container.append(pop2.last());
		}else{
			dimmed.removeAttr("style");
			container.append(dimmed);
		}*/
		var pop = container.find(".layPop.on").last();
		var headFixedLogo = document.querySelectorAll(".headFixed .logo"),
			logo = document.querySelectorAll(".logo"),
			body = document.querySelector("body"),
			posY = document.querySelector("html").scrollTop;

		if(pop.length > 0){
			container.append(pop);
		}
		if(container.find(".layPop.on").length > 0){
			$("body").addClass("layerPopupOpened");
			dimmed.css("display", "block");

			// 20211201 : iOS에서 팝업이 떴을 때 바닥면 스크롤 이슈가 있어 position fixed 방식으로 변경
			//if($(".headFixed .logo").length){
			//	posY = $(window).scrollTop() + 48;
			//	$("body").css({"position":"fixed","top":-posY});
			//} else{
			//	posY = $(window).scrollTop();
			//	$("body").css({"position":"fixed","top":-posY});

			if(headFixedLogo.length){
				posY = posY + 48;
				body.style.position = "fixed";
				body.style.top = -posY + "px";
			} else{
				posY = posY;
				body.style.position = "fixed";
				body.style.top = -posY + "px";
			}

			 /* 20210607
			 * 기존 마크업 되어있는 있는 팝업만 호출
			 * 로드 되는 팝업은 개발쪽에서 호출
			 */
			LayerPopup.inline.each(function(){
				if($(this).attr('id') == pop.attr('id')){
					hidePopupDimm(true, true);
				}
			});	
		}else{
			$("body").removeClass("layerPopupOpened");
			dimmed.css("display", "none");
			$(".btnOrderCondition, .btnSelectPeriod").removeClass("open");

			// 20211201 : iOS에서 팝업이 떴을 때 바닥면 스크롤 이슈가 있어 position fixed 방식으로 변경
			//posY = $("body").css("top");
			//var convPosY = $("body").css("top");
			//convPosY = parseInt(convPosY);
			//$("body").removeAttr("style");
			//if($(".logo").length){
			//	$(window).scrollTop(convPosY * -1 -48);
			//} else{
			//	$(window).scrollTop(convPosY * -1);
			//}
			posY = body.style.top;
			var logo = document.querySelectorAll(".logo"),
				body = document.querySelector("body"),
				convPosY = parseInt(posY);
			body.removeAttribute("style");
			if(logo.length){
				document.querySelector("html").scrollTo(0, -convPosY - 48);
			} else{
				document.querySelector("html").scrollTo(0, -convPosY);
			}

			/**
			 * 20210607
			 * 기존 마크업 되어있는 있는 팝업만 호출
			 * 로드 되는 팝업은 개발쪽에서 호출
			 */
			LayerPopup.inline.each(function(){
				if(LayerPopup.thisClose == undefined){
					return false;
				}
				if($(this).attr('id') == LayerPopup.thisClose.attr('id')){
					hidePopupDimm(false, true);
				}
			});
		}
		
		// 콘텐츠 스크롤 가능여부 체크
		if(pop.length > 0){
			clearInterval(timer_scrolling);
			timer_scrolling = setInterval(isContScrolling, 1000);
			isContScrolling();
		}else{
			clearInterval(timer_scrolling);
		}
	};// checkMultiPopup
	
	// 팝업 콘텐츠 스크롤 여부 판단
	var timer_scrolling;
	function isContScrolling(){
		var pop = container.find(".layPop.on").last();
		if(pop.length > 0){
			var cont = pop.find(".layCont:visible"),//.find(".lCont:visible")
				targ = pop.find(".layCont:visible");//find(".lCont:visible")
			if(cont.find(".stepContent .section").length > 0){
				targ = cont.find(".stepContent .section");
			}
			if(targ.outerHeight() < targ.get(0).scrollHeight){
				cont.addClass("scrolling");
			}else{
				cont.removeClass("scrolling");
			}
		}
	};// isContScrolling
	
	
	/**
	 * 알러트/컴펌 팝업 초기화
	 */
	function initAlertUI(){
		if(alertPopup instanceof jQuery){ return; }
		
		alertPopup = $("#layer_alert_popup");
		if(alertPopup.length == 0){
			alertPopup = $(template);
			container.prepend(alertPopup);
			
			alertPopup.find("button").bind("click.layerAlert", alertBtnClicked);
			alertTitle = alertPopup.find("h2.titLay");
			alertContent = alertPopup.find(".layCont .lCont");
			alertCancel = alertPopup.find(".btnCancel");
			alertOk = alertPopup.find(".btnOk");
		}
	};// initAlertUI
	
	/**
	 * 버튼 클릭 이벤트
	 */
	function alertBtnClicked(e){
		var btn = $(e.currentTarget),
			data = alertPopup.data("data");
		
		alertPopup.removeClass("on");
		
		if($.isFunction(data.callback)){
			setTimeout(function(){
				if(data.type == "alert"){
					data.callback();
				}else{
					data.callback(btn.data("action") == "ok");
				}
			}, 0);
		}
		
		if(LayerPopup.queList.length > 0){
			setTimeout(showNextQue, 1);
		}
	};
	
	/**
	 * 알러트/컨펌 데이터 큐에 추가하기
	 * @param {string}		text			- 팝업 내용 텍스트
	 * @param {object}		[data]			- 팝업 데이터 오브젝트
	 * @param {string}		[data.title]	- 팝업 타이틀 텍스트
	 * @param {string}		[data.ok]		- 확인 버튼 텍스트
	 * @param {string}		[data.cancel]	- 취소 버튼 텍스트
	 * @param {function}	[data.callback]	- 팝업 닫을 때 호출할 콜백 함수
	 * @praam {string}		[type]			- 팝업 구분 [alert|confirm]
	 */
	function addQue(text, data, type){
		if(typeof(data) != "object" || $.isEmptyObject(data)){
			data = {};
		}
		
		if(typeof(data.ok) != "string" || data.ok.length == 0){
			data.ok = "확인";
		}
		if(typeof(data.cancel) != "string" || data.cancel.length == 0){
			data.cancel = "취소";
		}
		if(typeof(data.title) != "string"){
			data.title = "";
		}
		data.text = text;
		data.type = type;
		
		LayerPopup.queList.push(data);
		
		showNextQue();
	};
	
	/**
	 * 다음 큐 화면에 표시하기
	 */
	function showNextQue(){
		initContainer();
		initAlertUI();
		
		if(LayerPopup.queList.length == 0 || alertPopup.hasClass("on")){ return; }
		
		var data = LayerPopup.queList.shift();
		alertPopup.data("data", data);
		
		alertCancel.css("display", (data.type == "alert" ? "none" : "block"));
		alertCancel.text(data.cancel);
		alertOk.text(data.ok);
		alertTitle.text(data.title);
		alertContent.html(data.text);
		
		alertPopup.addClass("on");
	};

	/**
	 * 페이지에 코딩된 레이어 팝업인 경우 초기화
	 */
	function initPreloadPopBtns(parent){
		var btns, btn, id, pop;
		if(parent.length > 0){
			btns = parent.find(".layerPopupButton[data-id]:not(.inited)");
		}else{
			btns = $(".layerPopupButton[data-id]:not(.inited)");
		}
		
		initContainer();
		
		btns.each(function(idx, itm){
			btn = $(itm);
			id = btn.data("id");
			pop = $("#" + id);
			if(pop.length){
				btn.data("path", id);
				dimmed.before(pop);
				pop.css("display", "none");
				
				if(typeof(parent) != "undefined" && parent.length > 0 && parent.data("remove") === true){
					// 동적 로드
					var arr = parent.data("children");
					if(typeof(arr) == "undefined"){
						arr = [];
						parent.data("children", arr);
					}
					arr.push(pop);
				}//else{
					LayerPopup.popupList.push({
						url : id,
						popup : pop
					});
				//}
				
				pop.find(".btnBtm .btnArea button, button.closeL").unbind("click.layerPopup").bind("click.layerPopup", closePopup);
				//initTouchArea(pop);
				initNestedForms(pop);
				btn.addClass("inited").unbind("click.layerPopup").bind("click.layerPopup", popupBtnClick);
			}
		});
	};
	
	function initNestedForms(pop){
		pop.find(".selectWrap").each(function() {
			SelectMenu.update($(this).find('select'));
		});
		pop.find(".calenInp:not(.timeInp)").each(function(idx, itm){
			new DatePicker(itm);
		});
		pop.find(".calenInp.timeInp").each(function(idx, itm){
			new TimePicker(itm);
		});
		
		
		LayerPopup.initButtons(pop);
		
		initAllAtOnce(pop);
		/*initSortRange(pop);
		initFormText();
		initTabAreas();
		initTabBasics();
		initToggleContents();
		initToolTips();
		initAccordions();
		initSwipers();
		initVideoPlayers();
		initMiscellaneous();*/
		
		initPopFixedWrap(pop);
		
		if(pop.hasClass("layPopBtm") || pop.hasClass("exitPopup")){
			pop.addClass("dragDownWrapper");
		}
		if(pop.hasClass("dragDownWrapper")){
			//pop.find(".btnBtm .btnArea button, button.closeL").addClass("dragDownClose");
			pop.find("button.closeL").addClass("dragDownClose");
			initDragDownArea();
		}
	};
	
	
	if(!$.isArray(LayerPopup.popupList)){
		// 레이어 팝업 리스트
		//LayerPopup.__proto__.popupList = [];
		LayerPopup.popupList = [];
		// 레이어 알러스/컴펌 리스트
		//LayerPopup.__proto__.queList = [];
		LayerPopup.queList = [];
	
		/**
		 * 레이어 팝업 URL 열기
		 * @param {string} url - 로드할 팝업의 URL
		 */
		//LayerPopup.__proto__.load = function(url, obj){
		LayerPopup.load = function(url, obj){
			if(typeof(url) != "string" || url == ""){ return; }
			
			var pop = getPopup(url, obj);
			/*var pop;
			if(typeof(obj) == "undefined"){
				pop = getPopup(url);
			}*/
			if(pop){
				if(pop.popup){
					openPopup(pop.popup);
				}
			}else{
				var obj1 = {
					url : url,
					popup : null,
					data : obj
				}
				/*if(typeof(getPopup(url, obj)) == "undefined"){
					LayerPopup.popupList.push(obj1);
				}*/
				if(typeof(obj) == "undefined"){
					LayerPopup.popupList.push(obj1);
				}
				
				var obj2 = {
					url : url,
					dataType : "text",
					success : function(data){
						loadSuccess(data, url, obj);
					},
					error : (obj && obj.error) ? obj.error : loadError
				}
				if(typeof(obj) != "undefined"){
					if(("" + obj.method).toLowerCase() == "post"){
						obj2.method = "POST";
					}
					if(typeof(obj.data) != "undefined"){
						obj2.data = obj.data;
					}
				}
				$.ajax(obj2);
			}
		};
	
		/**
		 * 레이어 팝업 연결 버튼 초기화하기
		 * 페이지 로드 시에 한 번 실행되므로, 버튼이 동적으로 추가되지 않으면 다시 실행할 필요는 없음
		 * @param {object}	[target]	- 버튼을 찾을 부모 객체
		 */
		//LayerPopup.__proto__.initButtons = function(target){
		LayerPopup.initButtons = function(target){
			var parent = $(target),
				btns;
			if(parent.length > 0){
				btns = parent.find(".layerPopupButton[data-path]:not(.inited)");
			}else{
				btns = $(".layerPopupButton[data-path]:not(.inited)");
			}
			btns.addClass("inited").unbind("click.layerPopup").bind("click.layerPopup", popupBtnClick);
			
			initPreloadPopBtns(parent);
		};
		
		/**
		 * 레이어 팝업 닫기
		 */
		//LayerPopup.__proto__.close = function(target){
		LayerPopup.close = function(target){
			$(target).find("button.closeL").trigger("click.layerPopup", "forceClose");
		};
		
		LayerPopup.resize = function(){
			resizePopCont();
		};
	
		/**
		 * 레이어 알러트 열기
		 * @param {string}		text			- 팝업 내용 텍스트
		 * @param {object}		[data]			- 팝업 데이터 오브젝트
		 * @param {string}		[data.title]	- 팝업 타이틀 텍스트
		 * @param {string}		[data.ok]		- 확인 버튼 텍스트
		 * @param {function}	[data.callback]	- 팝업 닫을 때 호출할 콜백 함수
		 */
		/*LayerPopup.__proto__.alert = function(text, data){
			addQue(text, data, "alert");
		};*/
	
		/**
		 * 레이어 컴펌 열기
		 * @param {string}		text			- 팝업 내용 텍스트
		 * @param {object}		[data]			- 팝업 데이터 오브젝트
		 * @param {string}		[data.title]	- 팝업 타이틀 텍스트
		 * @param {string}		[data.ok]		- 확인 버튼 텍스트
		 * @param {string}		[data.cancel]	- 취소 버튼 텍스트
		 * @param {function}	[data.callback]	- 팝업 닫을 때 호출할 콜백 함수
		 */
		/*LayerPopup.__proto__.confirm = function(text, data){
			addQue(text, data, "confirm");
		};*/
	}
	
	init();
	
	return this;
};// LayerPopup



/**
 * 스와이퍼 초기화
 */
function initSwipers(){
	var wraps = $(".swiperWrap:not(.inited)");
	if(wraps.length == 0){ return; }
	//wraps.addClass("inited");
	
	/**
	 * 구버전 스와이프 이벤트 처리
	 */
	function onSlideChange(sw){
		var ul = $(sw.wrapper),
			wrap = ul.closest(".swiperWrap"),
			idx = sw.activeLoopIndex,
			len = wrap.find(".swiper-slide:not(.swiper-slide-duplicate)").length - 1;
		
		// number pagination
		if(wrap.find("> .swiper-container > .paging > .swiper-paging").length > 0){
			$(wrap).find("> .swiper-container > .paging > .swiper-paging .current").text(idx + 1);
		}
		
		// bullet pagination
		if(wrap.find(".swiper-pagination").length > 0){
			wrap.find(".swiper-pagination-bullet").removeClass("swiper-pagination-bullet-active")
				.eq(idx).addClass("swiper-pagination-bullet-active");
		}
		
		// prev/next btn
		if(wrap.find(".swiper-button-prev").length > 0){
			if(idx == 0){
				wrap.find(".swiper-button-prev").addClass("swiper-button-disabled");
			}else{
				wrap.find(".swiper-button-prev").removeClass("swiper-button-disabled");
			}
		}
		if(wrap.find(".swiper-button-next").length > 0){
			if(idx == len){
				wrap.find(".swiper-button-next").addClass("swiper-button-disabled");
			}else{
				wrap.find(".swiper-button-next").removeClass("swiper-button-disabled");
			}
		}
		
		// 탭 컨트롤
		data = wrap.data("targetTab");
		if(typeof(data) != "undefined"){
			var tab = $(wrap.data("targetTab")),
				fn = tab.data("setTabIndex");
			
			if(typeof(fn) == "function"){
				fn(idx, tab);
			}
		}
		
		onTransition(sw);
	};
	
	/**
	 * 구버전 트랜지션 이벤트
	 * 좌우 버튼 컨트롤 안되는 버그 대응
	 */
	function onTransition(sw){
		var ul = $(sw.wrapper),
			cont = ul.closest(".swiper-container"),
			wrap = ul.closest(".swiperWrap"),
			prev = wrap.find(".swiper-button-prev"),
			next = wrap.find(".swiper-button-next"),
			x = parseInt(ul.css("left"), 10);
			
		if(isNaN(x)){
			x = 0;
		}
		
		if(x >= 0){
			prev.addClass("swiper-button-disabled");
		}else{
			prev.removeClass("swiper-button-disabled");
		}
		
		if(cont.width() >= ul.width() + x){
			next.addClass("swiper-button-disabled");
		}else{
			next.removeClass("swiper-button-disabled");
		}
	};
	
	
	var arr = [],
		old = (window.swiperVersion === 276),
		wrap, prop, swiper, evts, len, i, obj, cont, hasVideo, data;
	wraps.each(function(idx, itm){
		wrap = $(itm);
		if(!wrap.is(":visible")){ return; }
		/*if(wrap.hasClass("imageScalable")){
			// pass
		}else if(wrap.find(".swiper-slide").length <= 1){
			return true;
		}*/
		
		wrap.addClass("inited");
		
		prop = {
			pagination : {},
			navigation : {},
			on : {}
		}
		evts = [];
		
		// pagination
		if(wrap.find(".swiper-pagination").length > 0){
			var pg = wrap.find(".swiper-pagination");
			if(old){
				var cls = "swiper-pagination-" + getSerialNumber();
				
				pg.addClass(cls);
				prop.pagination = "." + cls;
				prop.paginationElementClass = "swiper-pagination-bullet";
				prop.paginationActiveClass = "swiper-pagination-bullet-active";
			}else{
				prop.pagination = {
					el : ".swiper-pagination",
					type : "bullets"
				}
				if(pg.hasClass("clickable")){
					prop.pagination.clickable = true;
				}
				//clickable
			}
		}
		
		// paging
		if(wrap.find("> .swiper-container > .paging > .swiper-paging").length > 0){
			evts.push({
				"name" : "slideChange",
				"func" : function(){
					$(this.$el).find("> .paging > .swiper-paging .current").text(this.realIndex + 1);
				}
			});
			wrap.find("> .swiper-container > .paging > .swiper-paging").html('<span class="current">1</span> / <span class="total">'+wrap.find("> .swiper-container > .swiper-wrapper > .swiper-slide").length+'</span>');
		}

		// arrow
		if(wrap.find(".swiper-button-prev, .swiper-button-next").length > 0){
			if(old){
				wrap.find(".swiper-button-prev, .swiper-button-next").bind("click.swiper", function(e){
					var btn = $(e.currentTarget),
						wrap = btn.closest(".swiperWrap"),
						sw = wrap.data("swiper");
					if(btn.hasClass("swiper-button-prev")){
						sw.swipePrev();
					}else if(btn.hasClass("swiper-button-next")){
						sw.swipeNext();
					}
				});
			}else{
				prop.navigation.nextEl = ".swiper-button-next";
				prop.navigation.prevEl = ".swiper-button-prev";
			}
		}
		
		// lazy load
		if(wrap.find(".swiper-lazy-preloader").length > 0){
			prop.lazy = true;
		}
		
		// zoom
		if(wrap.find(".swiper-zoom-container").length > 0){
			prop.zoom = {
				maxRatio : 3
			}
			wrap.find(".frmNum .btnCtrl").bind("click", function(e){
				try{
					var btn = $(e.currentTarget),
					wr = btn.closest(".swiperWrap"),
					sw = wr.data("swiper"),
					pr = sw.params.zoom,
					sc = Math.round(sw.zoom.scale);
					
					if(btn.hasClass("btnIncr")){
						if(sc < 3){
							sc++;
							pr.maxRatio = sc;
						}else{
							pr.maxRatio = 3;
						}
						sw.zoom.in();
						
						pr.maxRatio = 3;
					}else{
						if(sc > 1){
							sc--;
							pr.maxRatio = sc;
						}else{
							pr.maxRatio = 1;
						}
						sw.zoom.in();

						pr.maxRatio = 3;
					}
				}catch(e){}
			});
		}
		
		// slide per view
		data = wrap.data("slidePerView");
		if(data === "auto" || (typeof(data) == "number" && !isNaN(data) && data > 1)){
			prop.slidesPerView = data;
		}
		
		// slide per group
		data = wrap.data("slidePerGroup");
		if(typeof(data) == "number" && !isNaN(data) && data > 1){
			prop.slidesPerGroup = data;
		}
		
		// loop
		data = wrap.data("loop");
		if(data === true || data === "true"){
			prop.loop = true;
			evts.push({
				"name" : "transitionEnd",
				"func" : function(){
					if(this.isEnd){
						this.slideToLoop(0, 0);
					}
					if(this.isBeginning){
						this.slideToLoop(this.slides.length - 3, 0);
					}
				}
			});
		}
		
		var data = wrap.data("additionalSlides");
		if(typeof(data) == "number" && !isNaN(data) && data > 0){
			prop.loopAdditionalSlides = data;
		}
		
		// autoplay
		data = wrap.data("autoplay");
		if(typeof(data) == "number" && !isNaN(data) && data > 0){
			if(old){
				prop.autoplay = data;
			}else{
				prop.autoplay = {
						delay : data,
						disableOnInteraction : false
				}
			}
			wrap.find(".swiper-autoControls button").unbind("click.swiper").bind("click.swiper", function(e){
				try{
					var s = $(e.currentTarget).closest(".swiperWrap").data("swiper"),
						w = $(e.currentTarget).closest(".swiper-autoControls");
					if(s.autoplay.running){
						s.autoplay.stop();
						w.addClass("paused");

						// 메인, 지점 메인 공지 팝업 노출시 빅배너 스와이프 멈춤
						if($(".notiPop.on").length){
							s.autoplay.stop();
							w.addClass("paused");
						}
					}else{
						s.autoplay.start();
						w.removeClass("paused");

						// 메인, 지점 메인 공지 팝업 노출시 빅배너 스와이프 멈춤
						if($(".notiPop.on").length){
							s.autoplay.stop();
							w.addClass("paused");
						}
					}
				}catch(e){}
			});
		}
		
		// direction
		prop.direction = ((wrap.data("direction") === "vertical") ? "vertical" : "horizontal");
		
		// space
		data = wrap.data("spaceBetween");
		if(typeof(data) == "number" && !isNaN(data) && data > 0){
			prop.spaceBetween = data
		}
		
		// autoHeight
		data = wrap.data("autoHeight");
		if(data === true || data === "true"){
			prop.autoHeight = true;
		}
		
		// free mode
		data = wrap.data("freeMode");
		if(data === true || data === "true" || navigator.appVersion.indexOf("MSIE 9") > -1){
			prop.freeMode = true;
		}
		
		// cube effect
		data = wrap.data("cube");
		if(data === true || data === "true"){
			prop.effect = "cube";
			prop.grabCursor = true;
			prop.cubeEffect = {
				shadow: true,
				slideShadows: true,
				shadowOffset: 20,
				shadowScale: 0.94,
			};
		}
		
		// initial slide
		data = wrap.data("initial");
		if(typeof(data) == "number" && !isNaN(data) && data >= 0){
			prop.initialSlide = data;
		}
		
		// 컨트롤러
		data = wrap.data("targetTab");
		if(typeof(data) != "undefined"){
			evts.push({
				"name" : "slideChange",
				"func" : function(){
					var tab = $($(this.$el).closest(".swiperWrap").data("targetTab")),
					fn = tab.data("setTabIndex");
					
					if(typeof(fn) == "function"){
						fn(this.realIndex, tab);
					}
				}
			});
		}
		
		// 스와이프 내부 인라인 비디오 있는 경우
		hasVideo = false;
		wrap.find(".swiper-slide .videoPlayButton").each(function(vidx, vitm){
			if($(vitm).data("target") !== "popup"){
				hasVideo = true;
			}
		});
		if(hasVideo){
			// 스와이프 시에 재생중인 비디오 정지
			evts.push({
				"name" : "sliderMove",
				"func" : function(e){
					var vid = $(e.currentTarget).find(".videoPlayer.playing");
					if(vid.length > 0){
						vid.data("instance").stop();
					}
				}
			});
		}
		
		if(old){
			prop.onSlideChangeEnd = onSlideChange;
			prop.onSlideChangeStart = onSlideChange;
			prop.onSetWrapperTransform = onTransition;
			prop.onSetWrapperTransition = onTransition;
		}
		
		if(wrap.find(".swiper-slide").length <= 1){
			if(wrap.find(".swiper-zoom-container").length <= 0){
			//if(wrap.hasClass("imageScalable") == false){
				wrap.addClass("swiper-no-swiping");
				wrap.addClass("hideSwiperControl");
			}
			prop.autoplay = false;
			prop.loop = false;
		}
		
		cont = wrap.find(".swiper-container");
		if(cont.length > 1){
			cont = cont.eq(0);
		}
		if(old){
			var iecls = "swiperIE" + getSerialNumber();
			cont.addClass(iecls);
			swiper = new Swiper("." + iecls, prop);
		}else{
			swiper = new Swiper(cont, prop);
		}
		wrap.data("swiper", swiper);
		
		// nested swiper
		if(wrap.closest(".swiper-slide").length > 0){
			if(wrap.find(".swiper-slide").length <= 1){
				wrap.removeClass("swiper-no-swiping");
				swiper.allowSlideNext = false;
			}else{
			//if( ! (prop.slidesPerView == "auto" || prop.slidesPerView > 1) ){
				swiper.allowSlidePrev = false;
				evts.push(
					{
						"name" : "slideChange",
						"func" : function(){
							/*var x = this.realIndex,
								y = this.slides.length - 1;
						
							this.allowSlidePrev = (x != 0);
							this.allowSlideNext = (x != y);*/
							this.allowSlidePrev = ! this.isBeginning;
							this.allowSlideNext = ! this.isEnd;
						}
					}
				);
			//}
			}
		}
		
		if(old){
			onSlideChange(swiper);
		}
		
		// evtents
		if(!old){
			// 2.7.6은 이벤트 on 함수 지원 안함 (onSlideTouch, onSlideChangeStart/End 만 지원)
			len = evts.length;
			for(i=0; i<len; i++){
				obj = evts[i];
				swiper.on(obj.name, obj.func);
			}
			swiper.on("slideChange", function(){
				this.$el[0].dispatchEvent( (new CustomEvent("slideChange", { detail : {swiper : this, index : this.realIndex}, bubbles: true })) );

				// autuHeight 기능이 동작하지 않아서 새로 만듬
				$(function(){
					var swiperWrap = $(".swiperWrap[data-autoHeight='true']"),
						wrap = swiperWrap.find(".swiper-wrapper"),
						curSlide = swiperWrap.find(".swiper-slide-active img");
					if(swiperWrap.length){
						wrap.height(curSlide.height());
					}
				})
			});
		}
		
		// controller
		data = wrap.data("targetSwiper");
		if(typeof(data) != "undefined"){
			arr.push({
				swiper : swiper,
				target : $(data)
			})
		}

		/**
		 * 20210705
		 * 알림 내부 스와이프 버튼 show/hide 기능 추가
		 */
		 if(wrap.hasClass('swiperAlram')){
			var btn = wrap.find('button');
			var timeOut;
			btn.hide();
			wrap.unbind('touchstart.alram').bind('touchstart.alram',function(){
				var $this = $(this);
				btn.show();
				clearTimeout(timeOut);
				wrap.unbind('touchend.alram').bind('touchend.alram',function(){
					timeOut = setTimeout(function(){
						btn.hide();
					}, 3000);
				});
			});
		 }
	});
	
	
	len = arr.length;
	for(i=0; i<len; i++){
		obj = arr[i];
		try{
			obj.swiper.controller.control = obj.target.data("swiper");
		}catch(e){}
	}
	/**
	 * 20210608
	 * 리뷰 상세 스와이프 이미지 없을 때 px 사이즈 적용
	 */
	$(window).on('resize.swiper',function(){
		if (wraps.hasClass('reviewSwipe')) {
			wraps.find('.swiper-slide .vod > a').each(function(){
				var $this = $(this);
				$this.css({width:'',height:''});
				$this.width($(window).width());
				$this.height($this.closest('li').height());
			})
		}
	});
	$(window).trigger('resize.swiper')
};

$(function(){
	var notiPopSlide = $(".notiPopV211102 .swiper-container > .swiper-wrapper > .swiper-slide"),
		notiPopPaging = $(".notiPopV211102 .swiper-container > .paging");
	if(notiPopSlide.length === 1){
		notiPopPaging.css({display:"none"})
	}
})

function updateSwipers(targ){
	if($(".swiperWrap:not(.inited)").length > 0){
		initSwipers();
	}
	
	if((typeof(targ) == "undefined") || !(targ instanceof jQuery) || (targ.length  == 0)){
		targ = $("body");
	}
	
	setTimeout(function(){
		$(targ).find(".swiperWrap").each(function(idx, itm){
			var w = $(itm),
				s = w.data("swiper");
			if(w.find(".swiper-slide").length > 1){
				w.removeClass("swiper-no-swiping");
			}else{
				w.addClass("swiper-no-swiping");
			}
			if(typeof(s) != "undefined"){
				s.update();
			}
		});
	}, 1);
};

/**
 * 정렬 조회기간 초기화
 */
function initSortRange(target){
	var parent = $(target),
		terms;
	
	if(parent.length > 0){
		terms = parent.find(".termArea:not(.inited)");
	}else{
		terms = $(".termArea:not(.inited)");
	}
	terms.addClass("inited");
	
	terms.find("input[type=radio]").bind("click.sortRange", function(e){
		var btn = $(e.currentTarget),
			trg = btn.data("target");
		
		if(typeof(trg) != "undefined" && trg.length > 0){
			// 신규 타겟이 있는 경우
			btn.closest(".termArea").find("input[type=radio]").each(function(idx, itm){
				if(itm == btn.get(0)){
					$($(itm).data("target")).css("display", "block");
				}else{
					$($(itm).data("target")).css("display", "none");
				}
			});
		}else{
			// 기존 ID로 구분
			if(btn.attr("id").indexOf("sortingTerm") >= 0){
				btn.closest(".termArea").find(".calenWrap").css("display", "flex");
			}else{
				btn.closest(".termArea").find(".calenWrap").css("display", "none");
			}
		}
		LayerPopup.resize();
	});
};


/**
 * 기타 간단한 스크립트 초기화
 */
function initMiscellaneous(){
	// [로그인] SNS 리스트 더보기
	$(".snsList .moreArea button.snsMore").unbind("click.snslist").bind("click.snslist", function(e){
		$(e.currentTarget).attr("aria-expanded", true);
	});

	// [마이페이지] 신한은행 환전 통화선택 리스트 더보기 
	$(".shmoneyList .moreArea button.shmoneyMore").unbind("click.shmoneyList").bind("click.shmoneyList", function(e){
		$(e.currentTarget).attr("aria-expanded", true);
	});
	
	// 체크박스
	$(".frmSel input[type=checkbox]").each(function(idx, itm){
		var cb = $(itm);
		cb.unbind("change.formsel").bind("change.formsel", function(e){
			var cb = $(e.currentTarget),
				fs = cb.closest(".frmSel"),
				fw = cb.closest(".frmWrap");
			if(cb.is(":checked")){
				fs.addClass("cb_checked");
				fw.addClass("cb_checked");
			}else{
				fs.removeClass("cb_checked");
				fw.removeClass("cb_checked");
			}
		});
		cb.trigger("change.formsel");
	});
	
	// 라디오
	var deselect_si;
	function deselectRadio(r){
		r.prop("checked", false);
		r.closest(".frmSel").removeClass("rd_checked");
		r.trigger("change");
	};
	
	//$(".frmSel input[type=radio][aria-controls]").each(function(idx, itm){
	$(".frmSel input[type=radio]").each(function(idx, itm){
		var r = $(itm);
		r.unbind("change.formsel").bind("change.formsel", function(e){
			var r = $(e.currentTarget),
				fs = r.closest(".frmSel"),
				fl = r.closest(".frmList"),
				ctr = r.attr("aria-controls"),
				id = r.attr("id");

			fs.addClass("rd_checked");
			fs.siblings(".frmSel").each(function(jdx, jtm){
				$(jtm).removeClass("rd_checked");
			});
			
			// aria-controls로 레이어 제어
			//if(typeof(ctr) != "undefined"){
				var tg = $("#" + ctr);
				tg.addClass("tabON");
				
				fs.siblings(".frmSel").each(function(jdx, jtm){
					var fss = $(jtm),
						jid = fss.find("input[type=radio][aria-controls]").attr("aria-controls"),
						jtg = $("#" + jid);
					
					fss.removeClass("rd_checked");
					jtg.removeClass("tabON");
				});
			//}
			
			// frmList 제어
			if(fl.length > 0 && typeof(id) != "undefined"){
				fl.attr("data-id", id);
			}
		});
		
		/*if(typeof(r.attr("deselectable")) != "undefined"){
			r.unbind("click.deselect").bind("click.deselect", function(e){
				clearTimeout(deselect_si);
				deselect_si = setTimeout(function(){
					deselectRadio(r);
				}, 100);
			});
			r.unbind("change.deselect").bind("change.deselect", function(e){
				clearTimeout(deselect_si);
			});
		}*/
	});
	$(".frmSel input[type=radio]").each(function(idx, itm){
		var rb = $(itm),
			fs = rb.closest(".frmSel");
		if(typeof(rb.attr("deselectable")) != "undefined"){
			fs.unbind("touchstart.deselect").bind("touchstart.deselect", function(e){
				var fs = $(e.currentTarget),
					rb = fs.find("input[type=radio]");
				rb.data("checkedBefore", rb.is(":checked"));
			});
			rb.unbind("click.deselect").bind("click.deselect", function(e){
				var rb = $(e.currentTarget);
				if(rb.data("checkedBefore") === true){
					deselectRadio(rb);
				}
			});
		}
	});
	
	// ABC/가나다
	var floater_id;
	$(".searchBrandList .list li a").unbind("click.searchBrandList").bind("click.searchBrandList", function(e){
		var floater = $(e.currentTarget).closest(".brandBtm").find(".selectToggle"),
			a = $(e.currentTarget),
			w = a.closest(".brandBtm").find(".cateBrandList"),
			h = a.attr("href"),
			t, li, lc, os;
		
		clearTimeout(floater_id);
		floater.css("display", "none");
		floater.text(a.text());
		setTimeout(function(){
			floater.css("display", "block");
		}, 1);
		floater_id = setTimeout(function(){
			floater.css("display", "none");
		}, 4000);
		

		try{
			if(h.indexOf("javascript") >= 0){ return false; }
			t = w.find(h);
			if(t.length > 0){
				li = t.closest("li");
				if(li.length == 0 && t.parent().hasClass("brandSearchList")){
					li = t;
				}
				
				if(w.height() >= w.get(0).scrollHeight){
					// 페이지 스크롤
					lc = w.closest(".lCont");
					if(lc.length > 0){
						lc.scrollTop(li.offset().top - lc.offset().top + lc.scrollTop());
					}else{
						os = 0;
						if($("#header").length > 0){
							os = $("#header").outerHeight();
						}
						if($(".fixedWrap:visible").length > 0){
							os += $(".fixedWrap:visible").outerHeight();
						}
						GlobalScroll.scrollTo(li.offset().top - os - 10);
					}
				}else{
					// 레이어 스크롤
					w.scrollTop(li.position().top + w.scrollTop());
				}
				return false;
			}
		}catch(e){ console.warn(e) }
		
		return false;
		
		/*setTimeout(function(){
			if(h == decodeURIComponent(location.hash)){
				history.back();
			}
		}, 10);*/
	});
	
	// 트리링크
	$(".treeLink .btnLink").unbind("click.treelink").bind("click.treelink", function(e){
		var btn = $(e.currentTarget),
			tree = btn.closest(".treeLink"),
			aria = btn.attr("aria-selected");
		
		if(aria === true || aria === "true"){
			btn.attr("aria-selected", false)
				.attr("aria-expanded", false);
			tree.removeClass("opened");
		}else{
			var other = $(".treeLink .btnLink[aria-selected=true]");
			other.attr("aria-selected", false)
				.attr("aria-expanded", false);
			other.each(function(idx, itm){
				$(itm).closest(".treeLink").removeClass("opened");
			});
			
			btn.attr("aria-selected", true)
				.attr("aria-expanded", true);
			tree.addClass("opened");
		}
	});
	
	// 상품목록 장바구니버튼
	$(".btIco.icCart").unbind("click.prodList").bind("click.prodList", function(e){
		var btn = $(e.currentTarget);
		clearTimeout(btn.data("si"));
		btn.attr("aria-selected", true);
		// 210811 수정 - 체험단 페이지
		//btn.data("si", setTimeout(function(){
		//	btn.attr("aria-selected", false);
		//}, 1000));
	});
	
	// 상품 카테고리 구분
	$(".categoryArea button").unbind("click.prodCate").bind("click.prodCate", function(e){
		var btn = $(e.currentTarget),
			li = btn.parent();
		
		if(btn.hasClass("on")){ return; }
		
		btn.addClass("on").attr("aria-expanded", true);
		li.siblings().find("button").removeClass("on").attr("aria-expanded", false);
	});
	
	function initFixTopList(){
	    var ftl = $(".fixTopList"),
	        head = $("#header"),
	        ft = $(".fixedWrap"),
	        list = $(".fixArea"),
	        foot = $("footer"),
	        //toggleBtn = $(".searchBrandList li a");
	        h = 0,//head.outerHeight() + ft.outerHeight(),
	        dif = 0;
	    if(head.length > 0){
	    	h += head.outerHeight();
	    }
		if(ft.length > 0){
			h += ft.outerHeight();
		}
		
	    GlobalScroll.addListener(function(data){
	        var s = data.scroll,
	        	ftl = $(".fixTopList:visible"),
	        	list = $(".fixArea:visible"),
	        	btn = $(".cateBrandList:visible");//$(".cateBrandList .btnArea:visible");
	        if(ftl.length == 0 || list.length == 0){ return; }
	        
	        if(s + h >= ftl.offset().top){
	            ftl.addClass("fixed");
	            list.addClass("fixed");
	            
	            // 푸터로 밀어 올리기
	            try{
		            //dif = (foot.offset().top - s) - (list.offset().top - dif - s + list.outerHeight());
		            //dif = (btn.offset().top + btn.outerHeight() + parseInt(btn.css("margin-top"), 10) - s) - (list.offset().top - dif - s + list.outerHeight());
		            dif = (btn.offset().top + btn.outerHeight() - s) - (list.offset().top - dif - s + list.outerHeight());
		            if(dif > 0){
		            	dif = 0;
		            }
		            list.css("transform", "translate(0, " + dif + "px)");
	            }catch(e){}
	        }else{
	            ftl.removeClass("fixed");
	            list.removeClass("fixed");
	            list.css("transform", "translate(0, 0)");
	            dif = 0;
	        }
	    });
	    
	    $('.searchBrandList li a').unbind('click.searchbrand').bind('click.searchbrand',function(){
	    	list.addClass("up");
	    	setTimeout(function(){
	    		list.removeClass("up");
	    	}, 4000);
	    });
	    
	    //console.log($(".lCont .searchBrandList:visible"))
	    //$(".lCont .searchBrandList:visible")
	    
	    
	};// initFixTopList
	if($(".fixTopList").length > 0){
		initFixTopList();
	}
	

    if($(".lCont .searchBrandList:visible").length > 0){
    	$(".lCont .searchBrandList:visible").closest(".lCont").unbind("scroll.searchbrand").bind("scroll.searchbrand", function(e){
    		var lc = $(e.currentTarget),
    			list = lc.find(".searchBrandList"),
    			btm = lc.find(".brandBtm"),
    			btn = list.siblings(".toggleBt"),
    			css = {
    				"position" : "",
    				"top" : "",
    				"right" : ""
    			},
	    		css2 = {
    				"position" : "",
    				"top" : "",
    				"right" : ""
	    		};
    		
    		if(btm.position().top >= 0){
    			css.position = "";
    			css.top = "";
    			css.right = "";
    			css2.position = "";
    			css2.top = "";
    			css2.right = "";
    		}else{
    			css.position = "absolute";
    			css.top = lc.scrollTop() - 75;
    			css.right = 0;
    			css2.position = "absolute";
    			css2.top = lc.scrollTop() - 75 + 10;
    			css2.right = 10;
    		}
    		list.css(css);
    		btn.css(css2);
    	});
    }
    
    // 주문서, 옵션레이어 고정
    if($(".orderOption").length > 0){
    	GlobalScroll.addListener(function(data){
    		if($(".orderOption").offset().top - data.scroll - data.winHeight < -140){
    			$(".optionArea.orderFloating").css("display", "none");
    		}else{
    			$(".optionArea.orderFloating").css("display", "block");
    		}
    		if($(".orderFloating").css("display") == "none"){
    			$("body").addClass("floatingBody");
    		}else{
    			$("body").removeClass("floatingBody");
    		}
    	});
    }
};

function initSelectBox(wrap){
	var sels;
	if(wrap instanceof jQuery){
		sels = wrap.find(".selectWrap");
	}else{
		sels = $(".selectWrap");
	}
	sels.each(function() {
		SelectMenu.update($(this).find('select'));
	});
};// initSelectBox


/**
 * 드래그해서 닫기 영역 추가하기
 */
function initDragDownArea(){
	var $win = $(window),
		template = '<div class="dragDownArea"></div>',
		div, btn, touchTarget, touchStartX, touchStartY;
	/*if(DEV_MODE){
		template = '<div class="dragDownArea visibleTest"></div>';
	}*/
	
	// 아이폰 드래그 버그 대응
	// 다른곳 터치하여 영역으로 들어와도 touchStart 실행됨
	$win.unbind("touchstart.dragdown").bind("touchstart.dragdown", function(e){});
	
	$(".dragDownWrapper").each(function(idx, itm){
		var target = $(itm);
		if(target.find(">.dragDownArea").length > 0){ return; }

		div = $(template);
		btn = target.find(">.dragDownClose");
		if(btn.length > 0){
			btn.before(div);
		}else{
			target.append(div);
		}
		div.bind("touchstart.dragdown", touchStartPopup);
		/**
		 * 20210607 팝업 스위치 드래그 영역위로 오게 수정
		 */
		target.find('.frmSwitch').css('z-index','101');
	});
	

	function touchStartPopup(e){
		e.preventDefault();
		$win.bind("touchmove.dragdown", touchMovePopup);
		$win.bind("touchend.dragdown", touchEndPopup);
		touchTarget = $(e.currentTarget);
		/*if(DEV_MODE){
			touchTarget.css("background-color", "red");
		}*/
		touchStartX = e.originalEvent.touches[0].screenX;
		touchStartY = e.originalEvent.touches[0].screenY;
	};
	
	function touchMovePopup(e){
		var x = e.originalEvent.touches[0].screenX,
			y = e.originalEvent.touches[0].screenY,
			dx = x - touchStartX,
			dy = y - touchStartY,
			d = Math.sqrt(dx * dx + dy * dy),
			a = Math.atan2(dy, dx) * 180 / Math.PI;

		if(a >= 45 && a <= 135){
			if(dy > 50){
				touchEndPopup();
				touchTarget.siblings(".dragDownClose").trigger("click");
			}
		}else{
			if(d > 20){
				touchEndPopup();
			}
		}
		
		/*if(d < -20){
			touchEndPopup();
		}else if(dy > 50){
			touchEndPopup();
			touchTarget.siblings(".dragDownClose").trigger("click");
		}*/
	};
	
	function touchEndPopup(){
		$win.unbind("touchmove.dragdown", touchMovePopup);
		$win.unbind("touchend.dragdown", touchEndPopup);
		/*if(DEV_MODE){
			touchTarget.css("background-color", "yellow");
		}*/
	};
};

var bodyScrollingCount = 0;
function setBodyNoScrolling(flag){
	if(flag){
		bodyScrollingCount++;
	}else{
		if(bodyScrollingCount > 0){
			bodyScrollingCount--;
		}
	}
	
	if(bodyScrollingCount > 0){
		$("body").addClass("noscrolling");
	}else{
		$("body").removeClass("noscrolling");
	}
};

var hideDimmCount = 0;
var popStat = 0;
function hidePopupDimm(flag, ispop, type){
	var cnt = hideDimmCount;
	if(flag){
		hideDimmCount++;
	}else{
		if(hideDimmCount > 0){
			hideDimmCount--;
		}
	}
	
	/**
	 * 20210607
	 * 팝업 출력 후 셀렉트 박스 출력 시
	 */
	var len = $(".layPop.on").length;
	if(len > 0 && type == 'select'){
		if(hideDimmCount > 1){
			$("body").addClass("hidePopupDimm");
		}else{
			$("body").removeClass("hidePopupDimm");
		}
	}

	if(cnt == 0 && hideDimmCount > 0){
		if(ispop !== true){
			$("body").addClass("hidePopupDimm");
		}
		/*if(ispop === true){
			callAppScheme({
				"group" : "docbar",
				"function" : "show"
			});
		}*/

		callAppScheme({
			"group" : "popup",
			"function" : "show"
		});


	}else if(cnt > 0 && hideDimmCount == 0){
		if(ispop !== true){
			$("body").removeClass("hidePopupDimm");
		}
		/*if(ispop === true){
			callAppScheme({
				"group" : "docbar",
				"function" : "hide"
			});
		}*/

		callAppScheme({
			"group" : "popup",
			"function" : "hide"
		});

	}
};

// 앱 호출
function callAppScheme(obj){
	try{
		if(overpass.global.isApp){
			fnAppScheme(obj);
		}
	}catch(e){}
};

var VideoPlayer = function(param){
	var template = '<div class="videoPlayer">';
		template += '<div class="youtube"><div></div></div>';
		template += '<div class="mp4">';
			template += '<video playsinline>';
				 template += '<source type="video/mp4">';
			template += '</video>';
			template += '<div class="vp_control">';
				template += '<a class="vp_play_btn" /></a>';
				template += '<div class="vp_time"><span class="vp_cur"></span> / <span class="vp_dur"></span></div>';
				template += '<div class="vp_progress"><div class="vp_progbar"></div></div>';
				//template += '<div class="vidBtnArea"><button type="button" class="vp_fullscreen">전체화면</button><button type="button" class="vp_sound">사운드</button></div>';// 210919 추가
			template += '</div>';
			template += '<a class="vp_cover"></a>';
		template += '</div>';
	template += '</div>';
	
	var isYoutube = false,
		playing = false,
		player, playerWrap, cover, prog, youtube, video, source, vid, cur, dur, bar, si, vurl, purl, media, control;
	var me = this;

	
	
	function init(){
		player = $(template);
		playerWrap = player.find(".videoPlayer");
		video = player.find("video");
		cover = player.find(".vp_cover");
		vid = video.get(0);
		cur = player.find(".vp_cur");
		dur = player.find(".vp_dur");
		prog = player.find(".vp_progress");
		bar = player.find(".vp_progbar");
		source = player.find("video source");
		control = player.find(".vp_control");
		
		if(typeof(param) != "undefined" && (param.auto === true || param.auto === "true")){
			vid.muted = true;
		}
		
		video.bind("loadeddata", function(){
			updateTime();
			//player.height(Math.ceil(video.height()));
			var p = player.parent(),
				h = video.prop("videoHeight"),
				w = video.prop("videoWidth"),
				W = player.width(),
				vh = Math.ceil(h / w * W),
				H = p.height();
			
			if(vh >= H){
				player.height("100%");
			}else{
				player.height(vh);//h
			}
			play();
		});
		
		video.bind("pause play", function(e){
			clearTimeout(si);
			if(e.type == "play"){
				player.addClass("playing");
				playing = true;
				si = setTimeout(hideControl, 3000);
			}else{
				playing = false;
				player.removeClass("playing hide_ctr");
			}
		});

		control.find(".vp_fullscreen").on("click", function(event){
			if(VideoPopup.open){
				$(this).parents(".layPop.on").remove();
				$("body").removeClass("noscrolling");
				var hasDataTarget = $(".videoArea.open").data("target");
				if (hasDataTarget) {
					//alert(1);
				} else{
					var curTime2 = vid.currentTime;
					$(".hidden").text(curTime2);
					$(".videoArea.open").find("video")[0].currentTime = curTime2;
				}
			}else{
				VideoPopup.open;
			}
		});

		control.find("button.vp_sound").unbind("click").bind("click", function(){
			var vid = $(this).parents('.videoPlayer').find('video');
			if(vid.prop('muted')){
				vid.prop('muted', false);
				$(this).removeClass('muted');
			  } else{
				vid.prop('muted', true);
				$(this).addClass('muted');
			  }
		});

		player.find(".vp_play_btn").bind("click", function(){
			if(vid.paused){
				play();
			}else{
				pause();
			}
		});
		
		video.bind("timeupdate", function(){
			updateTime(vid.currentTime, cur);
		});
		
		prog.bind("touchstart.videoplayer", function(e){
			e.preventDefault();
			clearTimeout(si);
			player.removeClass("hide_ctr");
			
			var played = false;
			
			$(document).unbind("touchmove.videoplayer touchend.videoplayer").bind("touchmove.videoplayer touchend.videoplayer", function(E){
				var e = E.originalEvent,
					w = prog.width(),
					l = prog.offset().left,
					x, t;
				
				if(e.touches.length > 0){
					if(playing == true){
						played = true;
						pause();
					}
					x = e.touches[0].clientX - l;
					if(x < 0){
						x = 0;
					}else if(x > w){
						x = w;
					}
					t = Math.round(x / w * vid.duration);
					vid.currentTime = t;
				}
				
				if(e.type == "touchend"){
					$(document).unbind("touchmove.videoplayer touchend.videoplayer");
					if(played){
						played = false;
						play();
						si = setTimeout(hideControl, 2000);
					}
				}
			});
		});
		
		cover.bind("click", function(){
			clearTimeout(si);
			player.removeClass("hide_ctr");
			si = setTimeout(hideControl, 2000);
		});
		
		GlobalScroll.addListener(function(data){
			if(playing != true){ return; }
			
			var t = player.offset().top - data.scroll,
				b = t + player.height();
			
			if(t < 0 || b > data.winHeight){
				pause();
			}
		});
	};
	
	function play(){
		pauseAll();
		if(isYoutube){
			if(typeof(youtube) != "undefined"){
				youtube.playVideo();
			}
		}else{
			vid.play();
		}
	};
	
	function pause(){
		if(isYoutube){
			if(typeof(youtube) != "undefined"){
				youtube.pauseVideo();
			}
		}else{
			vid.pause();
		}
	};
	
	// 재생중인 비디오 모두 정지
	function pauseAll(targ){
		$(".videoPlayer").each(function(idx, itm){
			if($(itm).data("instance") !== targ){
				$(itm).data("instance").stop();
			}
		});
	};
	
	// 비디오 컨트롤바 가리기
	function hideControl(){
		player.addClass("hide_ctr");
	};
	
	// 재생시간 업데이트
	function updateTime(){
		var c = vid.currentTime,
			d = vid.duration,
			mc = Math.floor(c / 60),
			sc = Math.floor(c % 60),
			md = Math.floor(d / 60),
			sd = Math.floor(d % 60),
			p = c / d * 100;
		
		cur.text(mc + ":" + getTwoDigit(sc));
		dur.text(md + ":" + getTwoDigit(sd));
		bar.css("width", p + "%");
	};
	
	// 유튜브 API 로드완료
	function onYouTubeIframeAPIReady(){
		VideoPlayer.isYoutubeReady = true;
		$.each(VideoPlayer.youtubeList, function(idx, itm){
			itm.instance.load({
				video : itm.url,
				media : "youtube"
			});
		});
	};

	// 유튜브 초기화 하기
	function loadYoutubeAPI(url){
		if(typeof(VideoPlayer.youtubeList) == "undefined"){
			VideoPlayer.youtubeList = [];
		}
		VideoPlayer.youtubeList.push({
			instance : me,
			player : player,
			url : url
		});
		
		if(typeof(VideoPlayer.isYoutubeReady) == "undefined"){
			window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
			
			var tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
	};
	
	this.load = function(param){
		if(typeof(param) != "undefined"){
			vurl = param.video;
			purl = param.poster;
			media = param.media;
			if(param.target === "inline" && media === "youtube" && typeof(param.ratio) != "undefined"){
				player.find(".youtube").css("padding-top", param.ratio + "%");
			}
		}
		
		if(media === "youtube"){
			isYoutube = true;
			player.addClass("youtube");
			player.removeClass("mp4");
			if(typeof(VideoPlayer.isYoutubeReady) == "undefined"){
				loadYoutubeAPI(vurl);
			}else{
				youtube = new YT.Player(player.find(".youtube > div").get(0) , {
					height: "100%",
					width: "100%",
					playsinline : 1,
					videoId: vurl,
					events: {
						"onReady": function(e){
							play();
						},
						"onStateChange": function(e){
							if(e.data == YT.PlayerState.PLAYING){
								playing = true;
								pauseAll(me);
							}else{
								playing = false;
							}
						}
					}
				});
			}
		}else{
			isYoutube = false;
			player.removeClass("youtube");
			player.addClass("mp4");
			if(typeof(vurl) == "string"){
				source.attr("src", vurl);
			}
			if(typeof(purl) == "string"){
				video.attr("poster", purl);
			}
		}
	};
	me.play = play;
	me.stop = pause;

	if(typeof(VideoPlayer.pauseAll) == "undefined"){
		VideoPlayer.pauseAll = pauseAll;
	}
	
	$("button.vp_sound").unbind("click").bind("click", function(){
		var vid = $(this).closest('.videoPlayer').find('video');
		if(vid.prop('muted')){
			vid.prop('muted', false);
			$(this).removeClass('muted');
		  } else{
			vid.prop('muted', true);
			$(this).addClass('muted');
		  }
	});

	init();
	me.load(param);
	me.gui = player;
	player.data("instance", this);
	
	return this;
};// 비디오 플레이어

/**
 * 비디오 팝업 레이어 열기
 * @param targ 비디오 썸네일 버튼
 */
var VideoPopup = function(){
	var template = '<section class="layPop layPopFull blackType on" tabindex="0">';
	    template += '<h2 class="titLay"></h2>';
	    template += '<div class="layCont">';
	        template += '<div class="lCont" tabindex="0">';
	            template += '<div class="vodPopup">';
	                template += '<div class="vodArea"></div>';
	            template += '</div>';
	        template += '</div>';
	    template += '</div>';
	    template += '<button type="button" class="closeL">닫기</button>';
	template += '</section>';
	
	var body = $("body"),
		overflow, popup, player;

	/**
	 * 비디오 팝업 초기화
	 */
	function initPopup(){
		if(typeof(popup) == "undefined"){
			popup = $(template);
			popup.find(".closeL").bind("click", VideoPopup.close);
			player = new VideoPlayer();
			popup.find(".vodArea").append(player.gui);
		}
	};
	/**
	 * 비디오 팝업 열기
	 * @param {string}	param.vurl	- 비디오 URL
	 * @param {string}	param.purl	- 포스터 URL
	 * @param {string}	param.media	- 유튜브
	 * @param {string}	param.title	- 동영상 제목
	 */
	 
	VideoPopup.open = function(param){
		initPopup();
	
		// 공식스토어 메인, 가운데 정렬
		setTimeout(function(){
			if($(".brandList.typeFrame").length > 0){
				popup.find(".vodPopup").css({left:0, right:0});
				var y = popup.find(".videoPlayer.youtube:visible");
				if(y.length > 0){
					var yy = y.find(".youtube");
					var h = (y.height() - y.width() * 0.75) / 2;
					if(h > 0){
						yy.css("transform", "translate(0, " + h + "px)");
					}
				}
			}
		}, 100);
		// 공식스토어 메인, 가운데 정렬

		VideoPlayer.pauseAll();

		body.append(popup);
		setBodyNoScrolling(true);
		
		if(typeof(param) != "undefined" && typeof(param.title) == "string"){
			popup.find(".titLay").text(param.title);
		}else{
			popup.find(".titLay").text("동영상");
		}
		player.load(param);
	};	
	
	VideoPopup.close = function(){
		initPopup();
		player.stop();
		setBodyNoScrolling(false);
		popup.remove();
		$("body").removeClass("noscrolling");
	};
	
	return this;
};

var iframeVideoPopup = function(){
	var template = '<section class="layPop layPopFull blackType on" tabindex="0">';
	    template += '<h2 class="titLay"></h2>';
	    template += '<div class="layCont">';
	        template += '<div class="lCont" tabindex="0">';
	            template += '<div class="vodPopup">';
	                template += '<div class="vodArea"></div>';
	            template += '</div>';
	        template += '</div>';
	    template += '</div>';
	    template += '<button type="button" class="closeL">닫기</button>';
	template += '</section>';
	
	var body = $("body"),
		overflow, popup, player;

	/**
	 * 비디오 팝업 초기화
	 */
	function initPopup(){
		if(typeof(popup) == "undefined"){
			popup = $(template);
			popup.find(".closeL").bind("click", iframeVideoPopup.close);
			player = new VideoPlayer();
			popup.find(".vodArea").append(player.gui);
		}
	};
	
	/**
	 * 비디오 팝업 열기
	 * @param {string}	param.vurl	- 비디오 URL
	 * @param {string}	param.purl	- 포스터 URL
	 * @param {string}	param.media	- 유튜브
	 * @param {string}	param.title	- 동영상 제목
	 */
	 iframeVideoPopup.open = function(param){
		initPopup();
		
		// 공식스토어 메인, 가운데 정렬
		setTimeout(function(){
			if($(".brandList.typeFrame").length > 0){
				popup.find(".vodPopup").css({left:0, right:0});
				var y = popup.find(".videoPlayer.youtube:visible");
				if(y.length > 0){
					var yy = y.find(".youtube");
					var h = (y.height() - y.width() * 0.75) / 2;
					if(h > 0){
						yy.css("transform", "translate(0, " + h + "px)");
					}
				}
			}
		}, 100);
		// 공식스토어 메인, 가운데 정렬
		
		VideoPlayer.pauseAll();
		
		body.append(popup);
		setBodyNoScrolling(true);
		
		if(typeof(param) != "undefined" && typeof(param.title) == "string"){
			popup.find(".titLay").text(param.title);
		}else{
			popup.find(".titLay").text("동영상");
		}
		
		player.load(param);
	};
	
	iframeVideoPopup.close = function(){
		player.stop();
		
		setBodyNoScrolling(false);
		popup.remove();
		$("body").removeClass("noscrolling");
	};
	
	return this;
};

function initVideoPlayers(){
	$(".videoPlayButton > a").unbind("click.videoplayer").bind("click.videoplayer", function(e){
		var btn = $(e.currentTarget),
			wrap = btn.closest(".videoPlayButton, .videoBox, .videoBox .iframeVideoWrap");
			$(".videoArea").removeClass("open");
			$(this).closest(".videoArea").addClass("open");
		if(wrap.data("target") == "popup"){
			// 팝업으로 열기
			if(typeof(VideoPopup.open == "undefined")){
				new VideoPopup();
			}
			VideoPopup.open({
				video : wrap.data("video"),
				poster : wrap.data("poster"),
				media : wrap.data("media"),
				auto : wrap.data("autoplay"),
				title : wrap.data("title")
			});
		}else{

			// 인라인 재생
			if(typeof(wrap.data("player")) == "undefined"){
				var ratio = wrap.height() / wrap.width() * 100;
				var player = new VideoPlayer({
					video : wrap.data("video"),
					poster : wrap.data("poster"),
					media : wrap.data("media"),
					auto : wrap.data("autoplay"),
					ratio : ratio,
					target : "inline"
				});
				wrap.data("player", player);
				wrap.empty();
				wrap.append(player.gui);

				$(document).on("click", ".videoArea.open video[playsinline] + .vp_control .vidBtnArea .vp_fullscreen", function(){
					$(".videoArea").removeClass("open");
					$("video[playsinline] + .vp_control .vidBtnArea .vp_fullscreen").closest(".videoArea").addClass("open");
					new VideoPopup();
					VideoPopup.open({
						video : wrap.data("video"),
						poster : wrap.data("poster"),
						media : wrap.data("media"),
						auto : wrap.data("autoplay"),
						title : wrap.data("title"),
					});	
					var curTime1 = $(this).closest(".videoPlayer").find("video")[0].currentTime;
					$("body").append('<div class="hidden"></div>');
					$(".hidden").text(curTime1);
					$(".layPop.on").prev(".hidden").remove();
					$(".layPop.on").find("video")[0].currentTime = curTime1;
				})

				$("video[playsinline] + .vp_control .vidBtnArea .vp_sound").unbind("click").bind("click",function(){
					var vid = $(this).closest('.videoPlayer').find('video');
					if(vid.prop('muted')){
						vid.prop('muted', false);
						$(this).removeClass('muted');
					  } else{
						vid.prop('muted', true);
						$(this).addClass('muted');
					  }
				});
			}
		}

		if($(this).data("target") == "popup"){
			if(typeof(VideoPopup.open == "undefined")){
				new VideoPopup();
			}
			VideoPopup.open({
				video : wrap.data("video"),
				poster : wrap.data("poster"),
				media : wrap.data("media"),
				auto : wrap.data("autoplay"),
				title : wrap.data("title")
			});
		}
		/**
		* 20210527
		*/
		if (wrap.closest('.picDetail').length) {
			var big = 0;
			wrap.closest('.swiper-wrapper').find('img').each(function(){
				var $this = $(this);
				var h = $this.height();
				if(big < h){
					big = h;
				}
			});
			wrap.find('.mp4>video').height(big);
		}
		return false;
	});
	
	$("button.vp_sound").unbind("click").bind("click", function(){
		var vid = $(this).parents('.videoPlayer').find('video');
		if(vid.prop('muted')){
			vid.prop('muted', false);
			$(this).removeClass('muted');
		  } else{
			vid.prop('muted', true);
			$(this).addClass('muted');
		  }
	});

	$(".videoPlayButton > a").each(function(idx, itm){
		var btn = $(itm),
			wrap = btn.parent();
		if(wrap.data("autoplay") === true || wrap.data("autoplay") === "true"){
			btn.trigger("click.videoplayer");
		}
	});
	
	
	GlobalScroll.removeListener(checkAutoPlayer);
	if($(".videoPlayerAuto").length > 0){
		GlobalScroll.addListener(checkAutoPlayer);
	}
	
	function checkAutoPlayer(d){
		var T = d.scroll,
			B = T + d.winHeight,
			v, vid, t, b, src;
		var template = '<span class="btnWrap btnPlayStop">';
		template += '<button type="button" class="btnPlay">재생</button>';
		template += '<button type="button" class="btnStop">정지</button>';
		template += '</span>';
		template += '<span class="btnWrap btnSound">';
		template += '<button type="button" class="btnOn">소리켬</button>';
		template += '<button type="button" class="btnOff">음소거</button>';
		template += '</span>';
		
		$(".videoPlayerAuto").each(function(idx, itm){
			v = $(itm);
			t = v.offset().top;
			b = t + v.outerHeight();
			
			if(t > T && b < B){
				if(!v.hasClass("attached")){
					v.addClass("attached");
					if(v.find("video").length <= 0){
						src = v.data("video");
						if(typeof(src) == "string" && src.length > 0){
							v.append('<video autoplay playsinline preload="auto" loop muted src="'+src+'"></video>');
							v.append(template);
							v.find(".btnWrap button").bind("click", autoPlayerClick);
						}
					}else{
						if(!v.hasClass("paused")){
							v.find("video").get(0).play();
						}
					}
				}
			}else{
				if(v.hasClass("attached")){
					v.removeClass("attached");
					vid = v.find("video");
					if(vid.length > 0){
						v.find("video").get(0).pause();
					}
					//v.find("video").remove();
				}
			}
		});
	};// checkAutoPlayer
	
	function autoPlayerClick(e){
		var btn = $(e.currentTarget),
			cls = btn.attr("class"),
			v = btn.closest(".videoPlayerAuto"),
			vid = v.find("video").get(0);
		
		if(typeof(vid) == "undefined"){
			return false;
		}
		
		switch(cls){
		case "btnPlay":
			v.removeClass("paused");
			vid.play();
			break;
		case "btnStop":
			v.addClass("paused");
			vid.pause();
			break;
		case "btnOn":
			v.removeClass("soundOn");
			vid.muted = true;
			break;
		case "btnOff":
			v.addClass("soundOn");
			vid.muted = false;
			break;
		}
	};// autoPlayerClick
	
	$(".iframeVideoWrap a").unbind("click.iframebtn").bind("click.iframebtn", function(e){
		var div = $(e.currentTarget).closest(".iframeVideoWrap"),
			src = div.data("src");
		div.addClass("iframeVideoReady");
		var str = '<iframe name="vplayer" src="';
		str += src;
		str += '" frameborder="0" allowfullscreen=""';
		str += ' width="100%" height="' + div.height() + '"';
		str += '></iframe>';
		div.html(str);
		
		return false;
	});
};// 비디오 플레이어 버튼 초기화

function initVideoPlayersFullscreen(){
	$(".videoPlayButton > a + .vidBtnArea .vp_fullscreen").unbind("click.videoplayer").bind("click.videoplayer", function(e){
		$(".videoArea").removeClass("open");
		$(this).closest(".videoArea").addClass("open");
		var btn = event.currentTarget,
			wrap = btn.closest(".videoPlayButton, .videoBox, .videoBox .iframeVideoWrap");
		new VideoPopup();
		VideoPopup.open({
			video : wrap.data("video"),
			poster : wrap.data("poster"),
			media : wrap.data("media"),
			auto : wrap.data("autoplay"),
			title : wrap.data("title")
		});

		$(document).on("click", ".videoArea .videoPlayer vide[playsinline] + .vp_control .vidBtnArea .vp_fullscreen", function(){
			if($("body").find(".videoArea").hasClass("open")){
				var wrap = $(".videoArea.open");
					var ratio = wrap.height() / wrap.width() * 100;
					var player = new VideoPlayer({
						video : wrap.data("video"),
						poster : wrap.data("poster"),
						media : wrap.data("media"),
						auto : wrap.data("autoplay"),
						ratio : ratio,
						target : "inline"
					});
					wrap.data("player", player);
					wrap.empty();
					wrap.append(player.gui);
					var curTime2 = $(".videoArea.open").find("video")[0].currentTime;
					$(".hidden").text(curTime2);
					$(".videoArea.open").find("video")[0].currentTime = curTime2;
			}
		})

		if (wrap.closest('.picDetail').length) {
			var big = 0;
			wrap.closest('.swiper-wrapper').find('img').each(function(){
				var $this = $(this);
				var h = $this.height();
				if(big < h){
					big = h;
				}
			});
			wrap.find('.mp4>video').height(big);
		}
		return false;
	});
	
	$("button.vp_sound").unbind("click").bind("click", function(){
		var vid = $(this).parents('.videoPlayer').find('video');
		if(vid.prop('muted')){
			vid.prop('muted', false);
			$(this).removeClass('muted');
		  } else{
			vid.prop('muted', true);
			$(this).addClass('muted');
		  }
	});

	$(".videoPlayButton > a").each(function(idx, itm){
		var btn = $(itm),
			wrap = btn.parent();
		if(wrap.data("autoplay") === true || wrap.data("autoplay") === "true"){
			btn.trigger("click.videoplayer");
		}
	});
	
	
	GlobalScroll.removeListener(checkAutoPlayer);
	if($(".videoPlayerAuto").length > 0){
		GlobalScroll.addListener(checkAutoPlayer);
	}
	
	function checkAutoPlayer(d){
		var T = d.scroll,
			B = T + d.winHeight,
			v, vid, t, b, src;
		var template = '<span class="btnWrap btnPlayStop">';
		template += '<button type="button" class="btnPlay">재생</button>';
		template += '<button type="button" class="btnStop">정지</button>';
		template += '</span>';
		template += '<span class="btnWrap btnSound">';
		template += '<button type="button" class="btnOn">소리켬</button>';
		template += '<button type="button" class="btnOff">음소거</button>';
		template += '</span>';
		
		$(".videoPlayerAuto").each(function(idx, itm){
			v = $(itm);
			t = v.offset().top;
			b = t + v.outerHeight();
			
			if(t > T && b < B){
				if(!v.hasClass("attached")){
					v.addClass("attached");
					if(v.find("video").length <= 0){
						src = v.data("video");
						if(typeof(src) == "string" && src.length > 0){
							v.append('<video autoplay playsinline preload="auto" loop muted src="'+src+'"></video>');
							v.append(template);
							v.find(".btnWrap button").bind("click", autoPlayerClick);
						}
					}else{
						if(!v.hasClass("paused")){
							v.find("video").get(0).play();
						}
					}
				}
			}else{
				if(v.hasClass("attached")){
					v.removeClass("attached");
					vid = v.find("video");
					if(vid.length > 0){
						v.find("video").get(0).pause();
					}
					//v.find("video").remove();
				}
			}
		});
	};// checkAutoPlayer
	
	function autoPlayerClick(e){
		var btn = $(e.currentTarget),
			cls = btn.attr("class"),
			v = btn.closest(".videoPlayerAuto"),
			vid = v.find("video").get(0);
		
		if(typeof(vid) == "undefined"){
			return false;
		}
		
		switch(cls){
		case "btnPlay":
			v.removeClass("paused");
			vid.play();
			break;
		case "btnStop":
			v.addClass("paused");
			vid.pause();
			break;
		case "btnOn":
			v.removeClass("soundOn");
			vid.muted = true;
			break;
		case "btnOff":
			v.addClass("soundOn");
			vid.muted = false;
			break;
		}
	};// autoPlayerClick

	$(".iframeVideoWrap + .vidBtnArea .vp_fullscreen").unbind("click.iframebtn").bind("click.iframebtn", function(e){
		var div = $(e.currentTarget).parents(".videoBox").find(".iframeVideoWrap"),
			src = div.data("src");

		new iframeVideoPopup();
		iframeVideoPopup.open({
			video : div.data("video"),
			poster : div.data("poster"),
			media : div.data("media"),
			auto : div.data("autoplay"),
			title : div.data("title")
		});

		var str = '<div class="iframeVplayerWrap" style="height:' + div.height() + 'px' + ' ">';
		str += '<iframe name="vplayer" src="';
		str += src;
		str += '" frameborder="0" allowfullscreen=""';
		str += ' width="100%" height="' + div.height() + '"';
		str += '></iframe>';
		//str += '<div class="vidBtnArea"><button type="button" class="vp_fullscreen">전체화면</button><button type="button" class="vp_sound">사운드</button></div>'// 210919 추가
		str += '</div>';
		$(".vodArea").html(str);

		$(".iframeVplayerWrap .vp_fullscreen").bind("click", function(){
			$(this).parents(".layPop.on").remove();
			$("body").removeClass("noscrolling");
		});
		
		return false;
	});

};// 비디오 플레이어 버튼 초기화

/**
 * 개별 페이지 스크립트 실행하기
 */
// 디올 상세 (DIOR_DETAIL)
function fn_dior_detail(){
	$(".colorList .moreColor").bind("click", function(){
		$(".colorList ul").addClass("all");
	});
	/*$('.btnLike').on('click',function(){
		$(this).toggleClass('on');
	});*/
};

// 샤넬 (M_CHANEL)
function fn_m_chanel(){
	// 아코디온 클릭 시에 상단 스와이프 삭제하고 아코디온 버튼 이벤트 제거
	$(".brandAccordWrap .brandAccordList li > button").bind("click.hideswipe", function(){
		var wrap = $(".brandAccordWrap .swiperWrap"),
			sw = wrap.data("swiper");
		if(sw && sw instanceof Swiper){
			sw.destroy();
		}
		wrap.remove();
		$(".brandAccordWrap .brandAccordList li > button").unbind("click.hideswipe");
	});
};

// 공식스토어 (OMDP11.1)
function fn_omdp11_1(){
	
	$(".storeWrap .brandList.typeFrame .videoPlayButton a").each(function(){
		var a = $(this),
			img = a.find("img");
		
		img.css("display", "none");
		a.css({
			"background" : "url("+img.attr("src")+") no-repeat 50% 50%",
			"background-size" : "cover"
		});
	});
	
    // 액자형 swipe        
    var swiper, slides, slide, dummy, swipeHeight;
    
    function swiperTouchStart(){
        swiper.dragging = true;
    }
    
    function swiperTouchEnd(){
        swiper.dragging = false;
    }
    
    function setSlidesPosition(y){
    	if(y >= -5){
    		y = -swipeHeight * (slides.length - 2);
    	}
        if(y <= -swipeHeight * (slides.length - 1)){
            y = -swipeHeight;
        }
        var t, d, o, s;
        slides.each(function(idx, itm){
            slide = $(itm);
            t = y + idx * swipeHeight;
            o = {
                "top" : t,
                "transform" : "scale(1, 1)"
            }
            if(t < 0){
                o.top = 0;
                s = 1 + t / swipeHeight / 5;
                if(s < 0.6){
                    s = 0.6;
                }
                o.transform = "scale(" + s + ", " + s + ")"
            }
            slide.css(o);
        });
    }
    
    function progressDummy(){
        setSlidesPosition(parseInt(dummy.css("top"), 10));
    }
    
    function animateDummy(y){
        dummy.stop();
        dummy.css("top", swiper.oldTranslate);
        dummy.animate({top : y}, {duration : 200, progress : progressDummy, complete : progressDummy, easing : "easeOutSine"});
    }
    
    function setTranslate(){
        if(!swiper){ return; }
        
        var slide;
        var arr = [];
        var y = swiper.translate;
        if(swiper.dragging){
            swiper.oldTranslate = y;
            setSlidesPosition(y);
        }else{
            animateDummy(y);
        }
    }
    
    //$.easing.easeInSine = function(t){return 1-Math.cos(t*Math.PI/2)};
    
    swiper = new Swiper(".sticky-swiper", {
        direction : "vertical",
        spaceBetween : 40,
        loop : true,
        virtualTranslate : true,
        pagination : {
            el : ".swiper-pagination",
            type : "fraction"
        },
        on : {
            setTranslate : setTranslate,
            touchStart : swiperTouchStart,
            touchEnd : swiperTouchEnd
        }
    });
    slides = swiper.slides;
    swipeHeight = swiper.height + swiper.params.spaceBetween;
    setSlidesPosition(swiper.translate);
    dummy = $('<div class="dummy"></div>');
    $(".sticky-swiper .swiper-slide-duplicate .icoArea input[type=checkbox]").attr("id", "");
    
    // 스와이프 생성후 비디오 초기화
    initVideoPlayers();
    
    $('.brandList.typeFrame').height(swipeHeight);

    // view type
    $('.brandList').show();
    $('.typeFrame').hide();
    
    $('.viewType').on('click',function(){
        if($('.viewType').hasClass('thumb')){
            $(this).removeClass('thumb').addClass('frame');
            $('.typeFrame').hide();
            $('.typeThumb').show();
        } else{
            $(this).removeClass('frame').addClass('thumb');
            $('.typeThumb').hide();
            $('.typeFrame').show();
        }
    });
};

// 시슬리 & case 3개 (OMDP12.1)
function fn_omdp12_1(){
	// 브랜드 텍스트 더보기 버튼
	//initViewMore();
	var type = "actionHd";
	//대표이미지 및 로고 미등록시 컨텐츠 높이값
	if($(".brandImg img, .brandLogo img").length == 0){
    	$(".brandmallArea").addClass("no_imglogo");
    	type = "actionHdType02";
		//$("#header").addClass("actionHdType02");
		//$("#header").removeClass("actionHd");
	}else if($(".brandImg img").length == 0){
    	$(".brandmallArea").addClass("no_img");
    	type = "actionHdType02";
		//$("#header").addClass("actionHdType02");
		//$("#header").removeClass("actionHd");
	}else if($(".brandLogo img").length == 0){
    	$(".brandmallArea").addClass("no_logo");
	}
	
	// 스크롤 이벤트
	var head = $("#header");
	GlobalScroll.addListener(function(data){
		var hh = $(".brandmallCon").offset().top - 70;
		if(data.scroll >= hh){//158){
			head.removeClass(type);
		}else{
			head.addClass(type);
		}
	});
};

// 주문서 (OMOP3.1)
function fn_omop3_1(){
	$('.btnOrderList').on('click',function(){
		if($(this).hasClass('all')){
			$(this).removeClass('all').children('.text').html('주문상품 전체보기');
			$('.prodShow').css('height','235px');
		}else{
			$(this).addClass('all').children('.text').html('주문상품 간략보기');
			$('.prodShow').css('height','auto');
		}
	});
};

// 브랜드/상세 더보기 버튼
function initViewMore(){
	$(".viewMore button").unbind("click.viewmore").bind("click.viewmore", function(e){
		var btn = e.currentTarget,
			$btn = $(btn),
			div = $btn.closest(".viewMore"),
			em;
		if($btn.find("em").length > 0){
			em = $btn.find("em");
		}else{
			em = $btn;
		}
		
		$btn.blur();
		if(div.hasClass("expansion")){
			div.removeClass("expansion");
			if($("html").attr("lang") == "ko"){
				em.text("펼쳐보기");
			}else{
				em.text("展开");
			}
		}else{
			div.addClass("expansion");
			if($("html").attr("lang") == "ko"){
				em.text("접기");
			}else{
				em.text("收起");
			}
		}

		setTimeout(function(){
			btn.focus({preventScroll:true});
		}, 10);
	});
	
	var dc, vm;
	$(".detaliCon").each(function(idx, itm){
		dc = $(itm);
		vm = dc.closest(".viewMore");
		
		if(dc.height() <= vm.height()){
			vm.addClass("short");
		}
	});
};

// 남은시간 타이머
function initTimers(){
	var timers = $(".remainTimer");
	
	function remainTimer(now){
		var H = 1000 * 60 * 60,
			M = 1000 * 60,
			S = 1000,
			n = now.getTime(),
			c = false,
			o, t, d, h, m, s;
		$.each(timers, function(idx, itm){
			o = $(itm);
			t = o.data("datetime");
			d = t - n;
			if(d <= 0){
				o.text("00:00:00");
				o.addClass("ended");
				c = true;
			}else{
				h = Math.floor(d / H);
				m = Math.floor((d % H) / M);
				s = Math.floor((d % M) / S);
				o.text(getTwoDigit(h) +":"+ getTwoDigit(m) +":"+ getTwoDigit(s));
			}
		});
		if(c){
			timers = $(".remainTimer:not(.ended)");
			if(timers.length == 0){
				GlobalClock.removeListener(remainTimer);
			}
		}
	};// remainTimer
	
	GlobalClock.removeListener(remainTimer);
	if(timers.length > 0){
		var o, d;
		timers.each(function(idx, itm){
			o = $(itm);
			d = GlobalClock.getDate(o.data("time"));
			o.data("date", d);
			o.data("datetime", d.getTime());
		});
		GlobalClock.addListener(remainTimer);
	}
};// initTimers

// 편성표 날짜 가로 스크롤
function initTimeTracker(){
	function scrollCenter(b){
		var w = b.closest(".timeTracker"),
			t = b.position().left + w.scrollLeft() - w.width() / 2 + b.outerWidth() / 2 + 4;

		w.stop().animate(
			{ scrollLeft: t },
			{ duration : 100 }
		);
	};
	
	if($(".timeTracker:visible").length > 0){
		$(".timeTracker button").unbind("click.timetracker").bind("click.timetracker", function(e){
			var b = $(e.currentTarget);
			
			if(b.hasClass("on")){ return; }
			
			b.addClass("on")
				.siblings(".on").removeClass("on");
			scrollCenter(b);
		});
		
		if($(".timeTracker button.on").length > 0){
			scrollCenter($(".timeTracker button.on"));
		}
	}
};// initTimeTracker
// 편성표 날짜 가로 스크롤


// 팝업내 픽스트랩 초기화
function initPopFixedWrap(pop){
	var wraps = pop.find(".fixedWrap");
	if(wraps.length == 0){ return; }
	
	pop.find(".layCont").unbind("scroll.fixedwrap").bind("scroll.fixedwrap", function(e){
		var lc = $(e.currentTarget),
			lct = lc.offset().top,
			s = lc.scrollTop(),
			h = parseInt(lc.css("padding-top"), 10),
			t, cft, pft;
		if(isNaN(h)){
			h = 0;
		}
		
		wraps.each(function(){
			cft = $(this);
			if(cft.is(":visible") === false){ return; }
			
			t = cft.offset().top + lct;
			if(t <= h){
				cft.addClass("fixed");
				if(pft){
					pft.removeClass("fixed");
				}
			}else{
				cft.removeClass("fixed");
			}
			
			pft = cft;
		});
	});
	

	/*ft = fixer.top.target;
	ft.each(function(){
		cft = $(this);
		if(cft.closest(".layPop").length > 0){ return true; }
		
		if(cft.offset().top <= s + h){
			cft.addClass("fixed");
			if(pft){
				pft.removeClass("fixed");
			}
			cnt++;
		}else{
			cft.removeClass("fixed");
		}
		
		pft = cft;
		
		if(cnt > 0){
			head.addClass("noshade");
		}else{
			head.removeClass("noshade");
		}
	});*/
};






// 신구단 배송신청 화면 211001

// 팝업 닫기
function popAniComplete(){
    var pop = $(this);
    if(!pop.hasClass("on")){
        pop.css("display", "none");
        if(pop.data("remove") === true){
            removePopup(pop);
        }
    }
}

function selectEvtClosePop(e){
    var btn = $(e.target),
        pop = btn.closest(".layPop"),
		delay = 0;
    var aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : popAniComplete
		},
        dimmed = $(".dimmed"),
        btSorting = $(".btSorting.layerSorting");

        pop.stop(true).css({"display":"block", "bottom":"0"}).animate({"bottom":"-100%"}, aniProp);
		delay = 410;
        $("body").removeClass("layerPopupOpened");

        if(btn.closest("#layerPopupContainer").find(".dimmed").css("display") === "block"){
            setTimeout(function(){
                btn.closest("#layerPopupContainer").find(".dimmed").css("display", "none");
            }, 410)
		}
		pop.removeClass("on");
		setBodyNoScrolling(false);
		
        if( btSorting.hasClass("open")){
            btSorting.removeClass("open")
        }
}

//통관 회사 선택
$(".cmDeilveV2109 .custmClnceCorpV2109").unbind("click").bind("click", function(){
	setTimeout(function(){
		$("body").addClass("hidePopupDimm");
	}, 1);

	if( $("body").hasClass("hidePopupDimm") === true ){
		$("body.hidePopupDimm .wrapper .container .contents").css({overflow :"hidden"})
	}
	if( $(".layPop input").is(":checked") ){
		$("body").addClass("hidePopupDimm")
	}
})

// 주문상태
var newBuyingActBtn = $(".btnOrderCondition, .btnSelectPeriod");
newBuyingActBtn.click(function(){
	var thisBtn = $(this);
	if( thisBtn.hasClass("open") ){
		thisBtn.removeClass("open");
	} else{
		thisBtn.addClass("open");
	}
})

function newBuyngOrdCondPop(){
	var orderConditionsortNm = $("#orderCondition input[name=radSorting01]:checked").data("sortnm");
	$(".btnOrderCondition").html(orderConditionsortNm).addClass('txt');
}

var oderCondInp = $("#orderCondition input");
oderCondInp.unbind("click").bind("click", function(e){
	newBuyngOrdCondPop();
    selectEvtClosePop(e);
	setTimeout(function(){
		oderCondInp.closest("#layerPopupContainer").find(".dimmed").css("display", "none");
	}, 410)
})

// 구매기간
var newBuyingSelectPeriodBtn = $("#popPeriodSorting .termArea li:lt(3) input"),
	newBuyingSelectPeriodDirectInpBtn = $("#popPeriodSorting .btnBtm button"),
	newBuyingfnsearchDateTxt = $(".cmDeilveV2109 #fnsearchDate");

function newBuyingfnsearchDateTxtShowHide(){
	if ( newBuyingfnsearchDateTxt.html() == '' ){
		newBuyingfnsearchDateTxt.addClass("hide");
	} else{
		newBuyingfnsearchDateTxt.removeClass("hide");
	}

	if( newBuyingSelectPeriodBtn.is(":checked") ){
		var newBuyingSelectPeriodBtnChked = $("#popPeriodSorting .termArea li:lt(3) input:checked + label");
		newBuyingfnsearchDateTxt.show();
		newBuyingfnsearchDateTxt.text(newBuyingSelectPeriodBtnChked.text());
	}
}

newBuyingfnsearchDateTxtShowHide();

// 구매기간 날짜 입력 버튼 3개(3, 6, 12 개월) 선택된 텍스트값 바닥 페이지에 노출
newBuyingSelectPeriodBtn.unbind("click").bind("click", function(e){
    selectEvtClosePop(e);
	newBuyingfnsearchDateTxtShowHide();
})









// 상품상세 옵션선택 레이어 210927

// 바닥 페이지 색상 선택 영역 버튼에 disabled 추가
$(".contents .colorOption.v210927").find(".con .colorSl input").attr("disabled", true);

// 옵션 선택 팝업에서 색상 더보기 버튼을 눌렀을 때 높이값 계산
function calcColorViewMoreAreaHeight(e){
	var $target = $(e.target),
		content = $target.closest(".layCont"),
		targetSelect = $target.closest("div"),
		contentHeight = content.find(".colorSl").closest(".prSelect").height(),
		contentOpenHeight = content.height() + contentHeight - 2,
		contentCloseHeight = content.height() - contentHeight + 48;
		
	if( targetSelect.hasClass("open") ){
		targetSelect.removeClass("open");
		content.animate({
			height:contentCloseHeight
		}, 0)
	} else{
		targetSelect.addClass("open");
		content.animate({
			height:contentOpenHeight
		}, 0)
	}
}

// 옵션 선택 팝업에서 사이즈 더보기 버튼을 눌렀을 때 높이값 계산
function calcSizeViewMoreAreaHeight(e){
	var $target = $(e.target),
		content = $target.closest(".layCont"),
		targetSelect = $target.closest("div"),
		contentHeight = content.find(".sizeSl").closest(".prSelect").height(),
		contentOpenHeight = content.height() + contentHeight - 11,
		contentCloseHeight = content.height() - contentHeight + 61;
		
	if( targetSelect.hasClass("open") ){
		targetSelect.removeClass("open");
		content.animate({
			height:contentCloseHeight
		}, 0)
	} else{
		targetSelect.addClass("open");
		content.animate({
			height:contentOpenHeight
		}, 0)
	}
}

// 옵션 선택 팝업에서 옵션 리스트가 펼쳐졌을 때 높이값 계산
function calcDropdownSelectHeight(e){
	var $target = $(e.target),
		content = $target.closest(".layCont"),
		dropdownSelect = $target.closest(".dropdownSelect"),
		contentHeight = content.find(".optListWrap").height(),
		contentOpenHeight = content.height() + contentHeight,
		contentCloseHeight = content.height() - contentHeight;

	if( dropdownSelect.hasClass("open") ){
		dropdownSelect.removeClass("open");
		content.animate({
			height:contentCloseHeight
		}, 250)
	} else{
		dropdownSelect.addClass("open");
		content.animate({
			height:contentOpenHeight
		}, 250);

		if(dropdownSelect.closest("li").index() > 0){
			$('.lCont').animate({ 
				scrollTop: $(document).height()-$(window).height()}, 
				250, 
				"easeOutQuint"
			);
		}
	}
}

// 옵션 선택 팝업의 색상 선택 더보기 버튼 클릭 이벤트
$("#btnSortSelectOption .prSelect.colorOption .prList .btn").unbind("click").bind("click", calcColorViewMoreAreaHeight);

// 옵션 선택 팝업의 사이즈 선택 더보기 버튼 클릭 이벤트
$("#btnSortSelectOption .prSelect .sizeSl").closest(".prList").find(".btn").unbind("click").bind("click", calcSizeViewMoreAreaHeight);

// 옵션 선택 팝업의 선택하세요 버튼 클릭 이벤트
$("#btnSortSelectOption .btnDropdownSelect").unbind("click").bind("click", calcDropdownSelectHeight);

// 옵션 선택 팝업의 리스트가 펼쳐졌을 때 리스트 선택시 이벤트
$("#btnSortSelectOption .optListWrap input").unbind("click").bind("click", function(e){
	var btnSortSelectOption = $("#btnSortSelectOption .optListWrap input");
	calcDropdownSelectHeight(e);
	doneLengthChk();
	var btnDropdownSelect = $(this).closest(".dropdownSelect").find(".btnDropdownSelect"),
		layCont = $(this).closest(".layCont"),
		idx = $("#btnSortSelectOption .dropdownSelect").index($(this).parents(".dropdownSelect")),
		pageBtnSortSelectOption = $(".container .btnSelect.layerPopupButton"),
		idxText = btnDropdownSelect.text($(this).next("label").text());
		
	pageBtnSortSelectOption.eq(idx).text($(this).next("label").text());
	layCont.addClass("selected");
})


// 옵션 선택 팝업 상태 초기화
function btnSortSelectOptionConditionReset(){
	var colorSlInp = $("#btnSortSelectOption .colorSl input:checked"),
		sizeSlInp = $("#btnSortSelectOption .sizeSl input:checked"),
		colorCon = $(".container .colorSl").closest(".con"),
		colorSlLenght = $(".container .colorSl").closest(".con li").length,
		sizeCon = $(".container .sizeSl").closest(".con"),
		sizeSlLenght = $(".container .sizeSl").closest(".con li").length,
		dropdownSelect = $("#btnSortSelectOption .dropdownSelect");

	dropdownSelect.removeClass("open");
	colorSlInp.each(function(){
		if(colorSlLenght > 6){
			colorCon.addClass("moreList");
		}
		if(this.checked){
			var coloridx = $('#btnSortSelectOption .colorSl input').index(this);
			if(coloridx < 6){
				$(this).closest(".prList, .con").removeClass("moreListSelect");
				$(".container .v210927 .colorSl").closest(".con").removeClass("moreListSelect");
			}
		}
	})

	sizeSlInp.each(function(){
		if(sizeSlLenght > 6){
			sizeCon.addClass("moreList");
		}
		
		if(this.checked){
			var sizeidx = $('#btnSortSelectOption .sizeSl input').index(this);
			if(sizeidx < 5){
				$(this).closest(".prList, .con").removeClass("moreListSelect");
				$(".container .v210927 .sizeSl").closest(".con").removeClass("moreListSelect");
			}
		}
	})
}

// 옵션 선택 팝업의 하단 조회 버튼, 상단의 닫기 버튼 클릭시 이벤트
$("#btnSortSelectOption .btnBtm button, #btnSortSelectOption .closeL").unbind("click").bind("click", btnSortSelectOptionConditionReset);
 
// 옵션 선택 팝업의 팝업 외부 영역 클릭시 이벤트
$(document).unbind("click").bind("click", function(e){
	var btnSortSelectOptionOutsideTarget = $("#btnSortSelectOption");
	if(btnSortSelectOptionOutsideTarget.has(e.target).length == 0){
		btnSortSelectOptionConditionReset();
		sortSelecOptionDefault(e);
	}
})

function sortSelecOptionDefault(e){
	var LayerPopup = $("#btnSortSelectOption");
	if(LayerPopup.has(e.target).length === 0){
	}
}

// 바닥 페이지의 옵션 선택 셀렉트 박스 클릭시
$("button[data-id='btnSortSelectOption'").unbind("click").bind("click", function(){
	btnSortSelectOptionConditionReset();
	var btnSortSelectOption = $("button[data-id='btnSortSelectOption'"),
		$this = $(this);
	btnSortSelectOption.removeClass("on");
	$this.addClass("on");
});

// 바닥 페이지의 색상 선택 영역에 더보기 버튼이 있을 경우 팝업에도 동일하게 표현
var prSelectColor = $(".container .prSelect.v210927 .colorSl").closest(".con");
prSelectColor.closest(".prList").unbind("click").bind("click", function(){
	if(prSelectColor.hasClass("moreListSelect")){
		$("#btnSortSelectOption .con li .colorSl").closest(".con").addClass("moreList moreListSelect");
	}
})

// 바닥 페이지의 사이즈 선택 영역에 더보기 버튼이 있을 경우 팝업에도 동일하게 표현
var prSelectSize = $(".container .prSelect.v210927 .sizeSl").closest(".con");
prSelectSize.closest(".prList").unbind("click").bind("click", function(){
	if(prSelectSize.hasClass("moreListSelect")){
		$("#btnSortSelectOption .con li .sizeSl").closest(".con").addClass("moreList moreListSelect");
	}
})

// 화면 로드시 드롭다운 옵션 박스의 대표상품 선택
$(function(){
	var btnSortSelectOptDefSelect = $("#btnSortSelectOption .optListWrap input");
	if( btnSortSelectOptDefSelect.is(":checked") === true){
		var selectOpt = $("#btnSortSelectOption .optListWrap input:checked"),
			selectOptLabel = selectOpt.next("label"),
			contentSelectOpt = $(".container .prSelect .btnSelect.layerPopupButton"),
			btnSortSelectOpt = selectOpt.closest(".dropdownSelect").find(".btnDropdownSelect");

		var btnSortSelectOptEq = $("#btnSortSelectOption .dropdownSelect"),
			btnSortSelectOptEq0 = btnSortSelectOptEq.eq(0),
			btnSortSelectOptEq1 = btnSortSelectOptEq.eq(1),
			btnSortSelectOptEq2 = btnSortSelectOptEq.eq(2),
			btnSortSelectOptEq3 = btnSortSelectOptEq.eq(3),
			btnSortSelectOptEq4 = btnSortSelectOptEq.eq(4),
			btnSortSelectOptEq0Label = btnSortSelectOptEq0.find("input:checked + label"),
			btnSortSelectOptEq1Label = btnSortSelectOptEq1.find("input:checked + label"),
			btnSortSelectOptEq2Label = btnSortSelectOptEq2.find("input:checked + label"),
			btnSortSelectOptEq3Label = btnSortSelectOptEq3.find("input:checked + label"),
			btnSortSelectOptEq4Label = btnSortSelectOptEq4.find("input:checked + label"),
			contentSelectOptEq0 = contentSelectOpt.eq(0),
			contentSelectOptEq1 = contentSelectOpt.eq(1),
			contentSelectOptEq2 = contentSelectOpt.eq(2),
			contentSelectOptEq3 = contentSelectOpt.eq(3),
			contentSelectOptEq4 = contentSelectOpt.eq(4);
		contentSelectOptEq0.text(btnSortSelectOptEq0Label.text());
		contentSelectOptEq1.text(btnSortSelectOptEq1Label.text());
		contentSelectOptEq2.text(btnSortSelectOptEq2Label.text());
		contentSelectOptEq3.text(btnSortSelectOptEq3Label.text());
		contentSelectOptEq4.text(btnSortSelectOptEq4Label.text());
		btnSortSelectOptEq0.find(".btnDropdownSelect").text(btnSortSelectOptEq0Label.text());
		btnSortSelectOptEq1.find(".btnDropdownSelect").text(btnSortSelectOptEq1Label.text());
		btnSortSelectOptEq2.find(".btnDropdownSelect").text(btnSortSelectOptEq2Label.text());
		btnSortSelectOptEq3.find(".btnDropdownSelect").text(btnSortSelectOptEq3Label.text());
		btnSortSelectOptEq4.find(".btnDropdownSelect").text(btnSortSelectOptEq4Label.text());
	}
})

// 옵션 선택 팝업의 최초 처음 선택시 상태값 초기화
function btnSortSelectOptionResetAll(){
	$(this).addClass("change");
	var sizeSlInp = $("#btnSortSelectOption .sizeSl input"),
		colorSlInp = $("#btnSortSelectOption .colorSl input"),
		selectOpt = $("#btnSortSelectOption .optListWrap input"),
		btnSortSelectOpt = $("#btnSortSelectOption .btnDropdownSelect"),
		cnBtnSortSelectOpt = $("html:lang(zh) #btnSortSelectOption .btnDropdownSelect"),
		pageSortSelectOpt = $(".container .prSelect .btnSelect.layerPopupButton"),
		cnPageSortSelectOpt = $("html:lang(zh) .container .prSelect .btnSelect.layerPopupButton"),
		btnSortSelectBtnBtm = $("#btnSortSelectOption .btnBtm button"),
		pageColorSlInp = $(".container .layerPopupButton .colorSl input"),
		pageSizeSlInp = $(".container .layerPopupButton .sizeSl input");
		sizeSlInp.prop("checked", false);
		colorSlInp.prop("checked", false);
		pageColorSlInp.prop("checked", false);
		pageSizeSlInp.prop("checked", false);
		selectOpt.prop("checked", false);
		btnSortSelectOpt.text("선택하세요");
		cnBtnSortSelectOpt.text("请选择");
		pageSortSelectOpt.text("선택하세요");
		cnPageSortSelectOpt.text("请选择");
		btnSortSelectBtnBtm.prop("disabled", true);
}
$("#btnSortSelectOption .optionList").one("click", function(e){
	btnSortSelectOptionResetAll(e);
})

// 옵션 선택 팝업의 컬러칩 선택시
$("#btnSortSelectOption .con li .colorSl input").unbind("click").bind("click", function(e){
	$(this).prop("checked", true);
	doneLengthChk();
	var $target = $(e.target),
		idx = $target.closest(".con").find("li .colorSl input").index(this),
		getColorSlInp = $(".container .layerPopupButton .colorSl input");
	getColorSlInp.eq(idx).prop("checked", true);

	if($target.closest(".con").hasClass("moreList moreListSelect")){
		getColorSlInp.closest(".con").addClass("moreList moreListSelect")
	} else{
		getColorSlInp.closest(".con").removeClass("moreList moreListSelect")
	}
})

// 옵션 선택 팝업의 사이즈 선택시
$("#btnSortSelectOption .con li .sizeSl input").unbind("click").bind("click", function(e){
	$(this).prop("checked", true);
	doneLengthChk();
	var $target = $(e.target),
		idx = $target.closest(".con").find("li .sizeSl input").index(this),
		getSizeSlInp = $(".container .layerPopupButton .sizeSl input");
	getSizeSlInp.eq(idx).prop("checked", true);

	if($target.closest(".con").hasClass("moreList moreListSelect")){
		getSizeSlInp.closest(".con").addClass("moreList moreListSelect")
	} else{
		getSizeSlInp.closest(".con").removeClass("moreList moreListSelect")
	}
})

// 옵션 선택 팝업의 모든 옵션 선택시 하단 버튼 활성화
function doneLengthChk(){
	var doneLengthChk1 = $("#btnSortSelectOption .optionList > li").length;
	var doneLengthChk2 = $("#btnSortSelectOption .optionList > li input:checked").length
	if(doneLengthChk1 === doneLengthChk2){
		$("#btnSortSelectOption .btnBtm button").prop("disabled", false);
	}
}

// 메인 비쥬얼 배너 처음 로딩시 텍스트 엘리먼트들의 애니메이트 효과 제거
$(function(){
	var swipeBanner = $(".visualBanner"),
	banner = swipeBanner.find(".txtGroup"),
	bannerFlag = swipeBanner.find("li").eq(0).find(".flag"),
	titEvent = swipeBanner.find("li").eq(0).find(".title"),
	subTit = swipeBanner.find("li").eq(0).find(".desc"),
	bannerBtn = swipeBanner.find("button.slide");

	function swipeBannerRemoveStyle(){
		swipeBanner.removeClass("transitionOff");
	}

	setTimeout(function(){
		swipeBannerRemoveStyle()
	}, 300)

	$(document).ready(function(){
		setTimeout(function(){
			swipeBannerRemoveStyle();
		}, 300)
	})
})

function initAllAtOnce(pop){
	if(typeof(pop) != "undefined"){
		initSortRange(pop);
	}else{
		initSortRange();
	}
	initFormText();
	initTabAreas();
	initTabBasics();
	initToggleContents();
	initToolTips();
	initAccordions();
	initSwipers();
	initVideoPlayers();
	initVideoPlayersFullscreen();
	initMiscellaneous();
	initViewMore();
	initTimers();
	initTimeTracker();
};


$(function(){
	/*if($.isNumeric(window.serverTime) === false){
		window.serverTime = (new Date()).getTime();
	}*/
	
	new GlobalScroll();
	new GlobalClock();
	new LayerPopup();
	
	initHeader();
	initDockBar();
	initAllAtOnce();
	//initSortRange();
	//initFormText();
	//initTabAreas();
	//initTabBasics();
	//initToggleContents();
	//initTabFixed();
	//initToolTips();
	//initAccordions();
	//initSwipers();
	initScrollEvt();
	//initVideoPlayers();
	//initMiscellaneous();
});