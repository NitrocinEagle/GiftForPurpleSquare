function showStatistic() {
	var dateFrom = document.getElementById("dateFROM");
	var timeFrom = document.getElementById("timeFROM");
	var dateTo = document.getElementById("dateTO");
	var timeTo = document.getElementById("timeTO");
	
	var timeFromMS = new Date();
	timeFromMS.setDate(parseInt(dateFrom.value.slice(0,2)));
	timeFromMS.setMonth(parseInt(dateFrom.value.slice(3,5)) - 1);
	timeFromMS.setYear(parseInt(dateFrom.value.slice(6,10)));
	timeFromMS.setHours(parseInt(timeFrom.value.slice(0,2)));
	timeFromMS.setMinutes(parseInt(timeFrom.value.slice(3,5)));
	
	var timeToMS = new Date();
	timeToMS.setDate(parseInt(dateTo.value.slice(0,2)));
	timeToMS.setMonth(parseInt(dateTo.value.slice(3,5)) - 1);
	timeToMS.setYear(parseInt(dateTo.value.slice(6,10)));
	timeToMS.setHours(parseInt(timeTo.value.slice(0,2)));
	timeToMS.setMinutes(parseInt(timeTo.value.slice(3,5)));
	
	var JSONTime = new Object();
	JSONTime.from = String(timeFromMS.getTime());
	JSONTime.to = String(timeToMS.getTime());
	
	var divStatistic = document.getElementById("statistic");
	
	request =  new XMLHttpRequest();
	request.open('POST', '/get_statistic', false);
	request.send(JSON.stringify(JSONTime));
	var JSONStatistic = JSON.parse(request.responseText);
	
	var statisticStr = "<table border='1' cellpadding='0' cellspacing='0'><tr class='th1'><td>Посетитель</td><td>Время прибытия</td><td>Время ухода</td><td>Сколько пробыл</td><td>Сколько заплатил</td><td>Комментарий</td></tr>";
	var tr = 1;
	for (var i = 0; i < JSONStatistic.length; i++) {
		var arrivalTime = new Date();
		arrivalTime.setTime(parseInt(JSONStatistic[i]['arrival_time']));
		
		var leavingTime = new Date();
		leavingTime.setTime(parseInt(JSONStatistic[i]['leaving_time']));
		
		var attendanceTime = getTimeDifference(arrivalTime, leavingTime);
		arrivalTime =  toLocaleRussianTime(arrivalTime);
		leavingTime =  toLocaleRussianTime(leavingTime);
		
		statisticStr += "<tr class='tr" + tr + "'><td>" + JSONStatistic[i]['visitor'] + "</td><td>" + arrivalTime + "</td><td>" + leavingTime + "</td><td>" + attendanceTime + "</td><td>" + JSONStatistic[i]['paid'] + " руб. </td><td>" + JSONStatistic[i]['comment'] + "</td></tr>"
		tr == 1 ? 	tr = 2 : tr = 1;
	}
	divStatistic.innerHTML = "<font color='red'>" + statisticStr + "</font>";
}

function setTimesFromTo() {
	var dateFrom = document.getElementById("dateFROM");
	var timeFrom = document.getElementById("timeFROM");
	var dateTo = document.getElementById("dateTO");
	var timeTo = document.getElementById("timeTO");
	
	var request =  new XMLHttpRequest();
	request.open('POST', '/get_session_start_time', false);
	request.send(null);
	
	var sessionStartTime = new Date();
	sessionStartTime.setTime(parseInt(request.responseText) - 60000);
	var nowTime = new Date();
	var timestamp = nowTime.getTime();
	timestamp -= 60000;
	nowTime.setTime(timestamp);
	
	var dd = sessionStartTime.getDate();
	dd < 10 ? dd = '0' + dd : dd = dd;
	var mm = sessionStartTime.getUTCMonth() + 1;
	mm < 10 ? mm = '0' + mm : mm = mm;
	var yyyy = sessionStartTime.getUTCFullYear();
	var hh = sessionStartTime.getHours();
	hh < 10 ? hh = '0' + hh : hh = hh;
	var minutes = sessionStartTime.getMinutes();
	minutes < 10 ? minutes = '0' + minutes : minutes = minutes;
	dateFrom.value = '' + dd + '.' + mm + '.' + yyyy;
	timeFrom.value = '' + hh + ':' + minutes;
	
	dd = nowTime.getDate();
	mm = nowTime.getUTCMonth() + 1;
	yyyy = nowTime.getUTCFullYear();	
	hh = nowTime.getHours();
	minutes = nowTime.getMinutes();
	
	dd < 10 ? dd = '0' + dd : dd = dd;
	mm < 10 ? mm = '0' + mm : mm = mm;
	hh < 10 ? hh = '0' + hh : hh = hh;
	minutes < 10 ? minutes = '0' + minutes : minutes = minutes;
	
	dateTo.value = '' + dd + '.' + mm + '.' + yyyy;
	timeTo.value = '' + hh + ':' + minutes;
}

function makeReport() {
	var dateFrom = document.getElementById("dateFROM");
	var timeFrom = document.getElementById("timeFROM");
	var dateTo = document.getElementById("dateTO");
	var timeTo = document.getElementById("timeTO");
	
	var timeFromMS = new Date();
	timeFromMS.setDate(parseInt(dateFrom.value.slice(0,2)));
	timeFromMS.setMonth(parseInt(dateFrom.value.slice(3,5)) - 1);
	timeFromMS.setYear(parseInt(dateFrom.value.slice(6,10)));
	timeFromMS.setHours(parseInt(timeFrom.value.slice(0,2)));
	timeFromMS.setMinutes(parseInt(timeFrom.value.slice(3,5)));
	
	var timeToMS = new Date();
	timeToMS.setDate(parseInt(dateTo.value.slice(0,2)));
	timeToMS.setMonth(parseInt(dateTo.value.slice(3,5)) - 1);
	timeToMS.setYear(parseInt(dateTo.value.slice(6,10)));
	timeToMS.setHours(parseInt(timeTo.value.slice(0,2)));
	timeToMS.setMinutes(parseInt(timeTo.value.slice(3,5)));
	
	var JSONTime = new Object();
	JSONTime.from = String(timeFromMS.getTime());
	JSONTime.fromDate = timeFromMS.getDate();
	JSONTime.fromYear = timeFromMS.getUTCFullYear();
	JSONTime.fromMonth = timeFromMS.getUTCMonth() + 1;
	JSONTime.fromHours = timeFromMS.getHours();
	JSONTime.fromMinutes = timeFromMS.getMinutes();
	
	JSONTime.fromDate < 10 ? JSONTime.fromDate = '0' + JSONTime.fromDate: '0';
	JSONTime.fromMonth < 10 ? JSONTime.fromMonth = '0' + JSONTime.fromMonth: '0';
	JSONTime.fromHours < 10 ? JSONTime.fromHours = '0' + JSONTime.fromHours: '0';
	JSONTime.fromMinutes < 10 ? JSONTime.fromMinutes = '0' + JSONTime.fromMinutes: '0';
	
	JSONTime.to = String(timeToMS.getTime());
	JSONTime.toDate = timeToMS.getDate();
	JSONTime.toMonth = timeToMS.getUTCMonth() + 1;
	JSONTime.toYear = timeToMS.getUTCFullYear();
	JSONTime.toHours = timeToMS.getHours();
	JSONTime.toMinutes = timeToMS.getMinutes();
	
	JSONTime.toDate < 10 ? JSONTime.toDate = '0' + JSONTime.toDate: '0';
	JSONTime.toMonth < 10 ? JSONTime.toMonth = '0' + JSONTime.toMonth: '0';
	JSONTime.toHours < 10 ? JSONTime.toHours = '0' + JSONTime.toHours: '0';
	JSONTime.toMinutes < 10 ? JSONTime.toMinutes = '0' + JSONTime.toMinutes: '0';
	
	request =  new XMLHttpRequest();
	request.open('POST', '/make_report', false);
	request.send(JSON.stringify(JSONTime));
	
	alert("Отчет составлен. Найти его можно в папке reports");
}