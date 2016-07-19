/*简单的元素选择器*/
Window.prototype.seek=function(selector){
	var elem=document.querySelectorAll(selector);
	if (elem.length==1){ return elem[0]; }
	else{ return elem; }
}
/*创建一个新的日历*/
var calendar=new Calendar({
	/*数据返回的文本框*/
	getDateBox:'cal-get-date',
	/*当前日历盒子*/
	controllerBox:'cal-container',
	maxDate:[2016,12,15],
	animation:false,			
});
function Calendar(obj){
	/*当前日期,数据格式为number*/
	this.nowadays=new Date();									//不是固定值，根据当前系统日期改变
	/*获取日期的input*/
	this.getDateBox=seek('.'+obj.getDateBox);
	/*获取日期显示的盒子*/
	this.controllerBox=seek('.'+obj.controllerBox);
	/*日历盒子*/
	this.monthBox=this.controllerBox.lastElementChild;
	/*最小日期，默认为当前日期*/
	this.minDate=obj.minDate?new Date(obj.minDate[0],obj.minDate[1]-1,obj.minDate[2])
				:this.nowadays;
	/*最大日期,默认为最小日期*/
	this.maxDate=obj.maxDate?new Date(obj.maxDate[0],obj.maxDate[1]-1,obj.maxDate[2])
				:this.minDate;

	/*是否显示动画*/
	this.animation=obj.animation;
	var currentCal=this;
			
	/*显示日历*/
	this.controllerBox.addEventListener('click',function(e){
		var target=e.target;
		if (target.nodeName=='INPUT') { this.lastElementChild.style.display='block'; }
				
		else if (target.nodeName=='BUTTON')
		{
			var className=target.className;
			//将要显示下一个月还是上一个月
			var step=(className=='cal-next'?1:-2);
			var oldDate=seek('.cal-date-current').lastElementChild.lastElementChild.date;
			
			var before=className=='cal-next'?false:true;
			if (step==1&&oldDate.month==11)
			{
				var nextMonth=0;
				var nextYear=oldDate.year+1;
			}else if (step==-1&&oldDate.month==0)
			{
				var nextMonth=11;
				var nextYear=oldDate.year-1;
			}else{
				var nextMonth=oldDate.month+step;
				var nextYear=oldDate.year;
			}
			
			var newDate=new Date(nextYear,nextMonth,1);
			if (newDate>currentCal.maxDate) { return; }
			else if (currentCal.dateInfo(newDate).lastDay<currentCal.minDate) { return; }
			var current=document.querySelector('.cal-date-current');
			//判断上一次的定时器是否执行完，不判断move，因为move主程序先执行
			if (!current.movement)
			{
				//生成月份日期列表
				currentCal.createDate(newDate,before);
				//移动和替换current
				currentCal.move(current,className);
			}else{ console.log('等待...'); }
		}
	});
		
	/*给可选择的日期添加click事件,获取点击的日期*/
	this.monthBox.addEventListener('click',function(e){
		var target=e.target;
		if (target.className.indexOf('cal-active')>-1)
		{
			var lastChecked=this.querySelector('.cal-checked');
			if (lastChecked)
			{ lastChecked.className='cal-day cal-active'; }

			target.className='cal-day cal-checked';
			var day=parseInt(target.innerHTML);
			var checkedDate=target.parentNode.parentNode.parentNode.date;
			checkedDate.day=day;
			this.previousElementSibling.value=checkedDate.year+'-'+checkedDate.month+'-'+checkedDate.day;
			this.style.display='none';
		}
	});

	/*计算月份信息，传递给createDate生成日期*/
	/*传入参数*/
	this.dateInfo=function(date){
		var message={
			/*当前日期年*/
			year:date.getFullYear(),
            month:date.getMonth(),
			/*当前日*/
             day:date.getDate()
		};
		/*当月天数*/
		message.monthLen=new Date(message.year,message.month+1,0).getDate();
		/*当月第一天的date数据*/
		message.firstDay=new Date(message.year,message.month,1);
		/*当月第一天是星期几*/
		message.firstWeek=message.firstDay.getDay();
		/*当月最后一天的date数据*/
		message.lastDay=new Date(message.year,message.month,message.monthLen);
		/*返回月份信息*/
		return message;
	}
	this.move=function(current,className){
		//给current添加属性来判断是否正在执行';
		current.movement=true;
		var lists=current.children
		//切换动画是否执行
		if (this.animation)
		{
			var step=className=='cal-next'?-10:10;
			var left=null;
			current.style.left=className=='next'?'0px':'-300px';
			var steps=0;
			setTimeout(function(){
				left=parseInt(current.style.left);
				if (steps<300)
				{
					left+=step;
					steps+=10;
					current.style.left=left+'px';
					setTimeout(arguments.callee,10)
				}else if (steps==300)
				{
					current.style.left='0px';
							
					step==-10?current.removeChild(lists[0])
							:current.removeChild(lists[lists.length-1]);
					current.movement=false;
				}
			},10);
		}
		//不执行动画
		else{
			className=='cal-next'?current.removeChild(lists[0])
							 :current.removeChild(lists[lists.length-1]);
			/*执行完*/
			current.movement=false;
			}
		}

			/*显示日历盒子内容*/
	this.createDate=function(date,lastMonth){
		/*需要生成的月份信息，调用dateInfo*/
		var message=this.dateInfo(date);
		/*第一天是否大于等于最小日期*/
		if (message.lastDay>=this.minDate||message.firstDay<=this.maxDate)
		{
			var minDay=message.firstDay<=this.minDate?this.minDate.getDate():1;
			var maxDay=message.lastDay<=this.maxDate?message.monthLen:this.maxDate.getDate();
			/*找到放置box的父元素*/
			var parentBox=seek('.cal-date-current');
			/*创建新的月份盒子*/
			var box=document.createElement('div');
			box.className='cal-box';
			/*显示月份的日期条*/
			var head=document.createElement('h3');
			head.className='cal-date-bar';
			head.innerHTML=message.year+'年'+(message.month+1) +'月';
			box.appendChild(head);
			/*创建日盒子*/
			var tableMonth=document.createElement('table');
			tableMonth.className="cal-day-lists";
			/*给table加上当前月份信息，留给后面进行判断和选中日期*/
			tableMonth.date={year:message.year,month:message.month};
			var tbody=tableMonth.createTBody();
			var row=null;
			var cell=null;
			var g=0;
			/*for循环，添加每日*/
			for (var i=1-parseInt(message.firstWeek);i<=parseInt(message.monthLen) ;i++ )
			{
				/*每七个td生成新的tr，每个日期添加day*/
				if (g==0||g%7==0) { row=tbody.insertRow(); }
				/*先根据第一天的星期数生成相应的空白td*/
				cell=row.insertCell();
				/*从1号起给td添加日期*/
				if (i>0)
				{
					cell.innerHTML=i;
					cell.className='cal-day';
				}
				/*判断是否在minDate和maxDate之间,ture则添加active*/
				if (i>=minDay&&i<=maxDay)
				{ cell.className+=' cal-active'; }
				g++;
			}
			box.appendChild(tableMonth);
			/*判断盒子添加的位置*/
			lastMonth?parentBox.insertBefore(box,parentBox.firstChild)
					 :parentBox.appendChild(box);
		}	
	}

	/*操作月份切换时，计算新的月份信息*/
	this.changeDate=function(date,step){
		var message=this.dateInfo(date);
		var newMonth=message.month+step;
		return new Date(message.year,newMonth,message.day);
	}

	/*页面初始化显示*/
	this.init=function(){
		/*生成系统当前月*/
		this.createDate(this.nowadays,false);
		/*系统下一个月*/
		/*获取下一个月的数据*/
		var nextDate=this.changeDate(this.nowadays,1);
		this.createDate(nextDate);
	}
}

window.addEventListener('load',function(){
	calendar.init();
});
