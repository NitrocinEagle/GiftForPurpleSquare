	function view() {
		setTodayDate();
		viewReleasedVisitors();
	}
		
	function getCountTodayReleasedVisitors() {
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_count_released_visitors', false);
		request.send(null);
		return parseInt(request.responseText);
	}
		
	function getCurrentMoneyInCash() {
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_cash_money', false);
		request.send(null);
		return parseInt(request.responseText);
	}
		
	function getTodayIncome() {
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_today_income', false);
		request.send(null);
		return parseInt(request.responseText);
	}
		
	function changeCommentTariffVisitor(visitorNumber) {
		var commentInput = document.getElementById("today_visitors_tariff_table_comment_" + String(visitorNumber));
		var comment = String(commentInput.value);
		var request =  new XMLHttpRequest();
		request.open('POST', '/change_comment_tariff_visitor/' +String(visitorNumber), false);
		request.send(comment);
	}

	function getArrivalTime(time) {
			var time_str;
			var day = time.getDate();
			if (day < 10)
				day = '0' + day;
			var month = time.getMonth() + 1;
			if (month < 10)
				month = '0' + month;
			var hour = time.getHours();
			if (hour < 10)
				hour = '0' + hour;
			var minutes = time.getMinutes();
			if (minutes < 10)
				minutes = '0' + minutes;
			var seconds = time.getSeconds();
			if (seconds < 10)
				seconds = '0' + seconds;
			time_str = day + "." + month + "." + time.getFullYear() + " " + hour + ":" + minutes + ":" + seconds;
			return time_str;
		}
	
	function getAttendanceTime(time) {
			var curTime = new Date();
			var diffTime = curTime.getTime() - time.getTime();
			var time_str;
			var hour = Math.floor(diffTime / 1000 / 60 / 60) % 24;
			if (hour < 10)
				hour = '0' + hour;
			var minutes = Math.floor(diffTime / 1000 / 60)  % 60;
			if (minutes < 10)
				minutes = '0' + minutes;
			var seconds = Math.floor(diffTime / 1000) % 60;
			if (seconds < 10)
				seconds = '0' + seconds;
			time_str = hour + ":" + minutes; //+ ":" + seconds;
			return time_str;
		}
	
	function getTimeDifference(time1, time2) {
			var diffTime = time2.getTime() - time1.getTime();
			if (diffTime < 0)
				diffTime *= -1;
			var time_str;
			var hour = Math.floor(diffTime / 1000 / 60 / 60) % 24;
			if (hour < 10)
				hour = '0' + hour;
			var minutes = Math.floor(diffTime / 1000 / 60)  % 60;
			if (minutes < 10)
				minutes = '0' + minutes;
			var seconds = Math.floor(diffTime / 1000) % 60;
			if (seconds < 10)
				seconds = '0' + seconds;
			time_str = hour + ":" + minutes;// + ":" + seconds;
			return time_str;
		}
	
	function getPriceByTraffic(arrivalTime) {
		var curTime = new Date();
		var diffTime = curTime.getTime() - arrivalTime.getTime();
		var price = 1.5*(Math.floor(diffTime / 1000 / 60));
		if (price < TODAY_MAXIMUM_CHECK)
			return price;
		else
			return TODAY_MAXIMUM_CHECK;
	}

	function millisecondsToTime(ms) {
			var date = new Date(ms);
			return date;
		}
		
	function addVisitorTariff(numberElement) {
		if (numberElement.style.background == "rgb(0, 221, 0)") {
			numberElement.style.background = "red"
			
			visitorsTariff[VISITORS_TARIFF_NUMB] = new Object();
			visitorsTariff[VISITORS_TARIFF_NUMB].number = parseInt(numberElement.innerHTML);
			visitorsTariff[VISITORS_TARIFF_NUMB].arrivalTime = new Date();
			
			todayVisitorsTariffTable = document.getElementById("visitors_tariff_log_table");
			var tr;
			todayVisitorsTariffTable.rows.length % 2 == 0? tr = 2: tr = 1;
			var newRow = todayVisitorsTariffTable.insertRow();
			newRow.id = "today_visitors_tariff_table_row_" + visitorsTariff[VISITORS_TARIFF_NUMB].number;
			newRow.align = "center";
			newRow.className = "tr" + tr;
		
			var newCell = newRow.insertCell(0);
			newCell.innerHTML = visitorsTariff[VISITORS_TARIFF_NUMB].number;
			
			newCell = newRow.insertCell(1);
			newCell.innerHTML = getArrivalTime(visitorsTariff[VISITORS_TARIFF_NUMB].arrivalTime);
			
			newCell = newRow.insertCell(2);
				
			newCell = newRow.insertCell(3);
				
			newCell = newRow.insertCell(4);
				
			newCell.innerHTML = "<input id='today_visitors_tariff_table_comment_" +String(visitorsTariff[VISITORS_TARIFF_NUMB].number) + "' size='20' value='' class='input_comment' placeholder='Комментарий' onblur=changeCommentTariffVisitor('" + String(visitorsTariff[VISITORS_TARIFF_NUMB].number) + "')  />";
				
			newCell = newRow.insertCell(5);
			
			newCell.innerHTML = '<button class="button_tariff_visitor_stop" onclick="releaseVisitorTariff(' + visitorsTariff[VISITORS_TARIFF_NUMB].number + ')">Стоп</button>'
			
			/* Формируем объект для отправки на сервер в БД в таблицу сегодняшних посетителей */
			var new_guest = new Object();
			new_guest.number = String(visitorsTariff[VISITORS_TARIFF_NUMB].number);
			new_guest.arrivalTime = String(visitorsTariff[VISITORS_TARIFF_NUMB].arrivalTime.getTime());
		
			var request =  new XMLHttpRequest();
			request.open('POST', '/add_today_visitor_tariff', false);
			request.send(JSON.stringify(new_guest));
			VISITORS_TARIFF_NUMB++;
		}
		else
			alert("Номерок уже занят другим посетителем!");
	}

	function getTodayVisitorsTariff() {
			VISITORS_TARIFF_NUMB = 0;
			var visitors = new Array();
			var request =  new XMLHttpRequest();
			request.open('POST', '/get_today_visitors_tariff', false);
			request.send(null);
			var JSONGuests = JSON.parse(request.responseText);
			for (var i = 0; i < JSONGuests.length; i++) {
				visitors[VISITORS_TARIFF_NUMB] = new Object();
				visitors[VISITORS_TARIFF_NUMB].number = JSONGuests[i].number;
				visitors[VISITORS_TARIFF_NUMB].comment = JSONGuests[i].comment;
				visitors[VISITORS_TARIFF_NUMB].arrivalTime = new Date();
				visitors[VISITORS_TARIFF_NUMB].arrivalTime.setTime(parseInt(JSONGuests[i].arrivalTime));
				VISITORS_TARIFF_NUMB++;
			}
			return visitors;
		}
		
	function releaseVisitorTariff(visitorNumb) {
			document.getElementById("number_" + visitorNumb).style.background = "#00dd00";
			
			todayVisitorsTariffTable = document.getElementById("visitors_tariff_log_table");
			var row = document.getElementById("today_visitors_tariff_table_row_" + String(visitorNumb));
			todayVisitorsTariffTable.deleteRow(row.rowIndex);
			
			var request =  new XMLHttpRequest();
			request.open('POST', '/release_visitor_tariff/' + String(visitorNumb), false);
			request.send(null);
			request = null;
		
			var newGuest = new Object();
			var ind = 0;
			for (var i = 0; i < VISITORS_TARIFF_NUMB; i++) {
				if (visitorsTariff[i].number == visitorNumb)
				{
					ind = i;
					break;
				}
			}
			
			// Кладем деньги в кассу за данного посетителя по тарифу
			// беда-беда! при добавлении 1.5 рубля, добавится 1 рубль
			// НУЖНО ПЕРЕДЕЛАТЬ ВСЕ ДЕНЬГИ В СТРОКИ ИЛИ ВО float
			var money = parseInt(getPriceByTraffic(visitorsTariff[ind].arrivalTime));
			addMoneyToCash(money, "тариф");
			
			
			newGuest.comment = String(visitorsTariff[ind].comment);
			newGuest.number = String(visitorsTariff[ind].number);
			newGuest.arrivalTime = String(visitorsTariff[ind].arrivalTime.getTime());
			newGuest.leavingTime = String((new Date()).getTime());
			newGuest.price = String(getPriceByTraffic(visitorsTariff[ind].arrivalTime));
			var JSONNewGuest = JSON.stringify(newGuest);
			request =  new XMLHttpRequest();
			request.open('POST', '/add_visitor_tariff', false);
			request.send(JSONNewGuest);
			
			for (var i = 0; i < VISITORS_TARIFF_NUMB; i++)
				visitorsTariff[i] = null;
			visitorsTariff = null;
			
			visitorsTariff = getTodayVisitorsTariff();
			document.getElementById("count_released_visitors").innerHTML = parseInt(getCountTodayReleasedVisitors());
			document.getElementById("current_money_in_cash").innerHTML = getCurrentMoneyInCash();
			document.getElementById("today_income").innerHTML = parseInt(getTodayIncome());
		}

	function getTodayVisitors() {
			VISITORS_NUMB = 0;
			var visitors = new Array();
			var request =  new XMLHttpRequest();
			request.open('POST', '/todayvisitors', false);
			request.send(null);
			var JSONVisitors = JSON.parse(request.responseText);
			for (var i = 0; i < JSONVisitors.length; i++) {
				visitors[VISITORS_NUMB] = new Object();
				visitors[VISITORS_NUMB].number = parseInt(JSONVisitors[i].number);
				visitors[VISITORS_NUMB].price = parseInt(JSONVisitors[i].price);
				visitors[VISITORS_NUMB].action = String(JSONVisitors[i].action);
				visitors[VISITORS_NUMB].arrivalTime = new Date();
				visitors[VISITORS_NUMB].arrivalTime.setTime(parseInt(JSONVisitors[i].arrivalTime));
				VISITORS_NUMB++;
			}
			return visitors;
		}
		
	function getTodayMaxCheck() {
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_max_check', false);
		request.send(null);
		return parseInt(request.responseText);
	}
		
	function setTodayDate() {
		var date = new Date();
		var todayIs = document.getElementById("todayIs");
		var seconds = date.getSeconds();
		todayIs.innerHTML = '<font size="3" color="white">Текущие дата и время: ' + toLocaleRussianTime(date) + ':' + (seconds < 10 ? '0' + seconds: seconds) + '</font>';
	}
	
	function setNumbers(todayVisitorsTariff) {
			for (var i = 0; i < 100; i++) {
				var number = document.getElementById("number_" + String(i));
				if (number) {
					number.style.background = "#00dd00";
				}
			}
			for (var i = 0; i < VISITORS_TARIFF_NUMB; i++) {
				var number = document.getElementById("number_" + String(todayVisitorsTariff[i].number));
				if (number) {
					number.style.background = "red";
				}
			}
		}
	
	function generateTodayVisitorsTariffTable(todayVisitorsTariff) {
			todayVisitorsTariffTable = document.getElementById("visitors_tariff_log_table");
			var tr = 1;
			for (var i = 0; i < todayVisitorsTariff.length; i++) {
				var newRow = todayVisitorsTariffTable.insertRow();
				newRow.id = "today_visitors_tariff_table_row_" + todayVisitorsTariff[i].number;
				newRow.className = "tr" + tr;
				tr == 1 ? 	tr = 2 : tr = 1;
				newRow.align = "center";
				var newCell = newRow.insertCell(0);
				newCell.innerHTML = todayVisitorsTariff[i].number;
				newCell = newRow.insertCell(1);
				newCell.innerHTML = getArrivalTime(todayVisitorsTariff[i].arrivalTime);
				newCell = newRow.insertCell(2);
				newCell = newRow.insertCell(3);
				newCell = newRow.insertCell(4);
				newCell.innerHTML = "<input id='today_visitors_tariff_table_comment_" +String(todayVisitorsTariff[i].number) + "' size='20' value='" +String(todayVisitorsTariff[i].comment) + "' class='input_comment' placeholder='Комментарий' onblur=changeCommentTariffVisitor('" + String(todayVisitorsTariff[i].number) + "')  />";
				newCell = newRow.insertCell(5);
				newCell.innerHTML = '<button class="button_tariff_visitor_stop" onclick="releaseVisitorTariff(' + todayVisitorsTariff[i].number + ')">Стоп</button>'
			}
		}

	function update() {
			setTodayDate();
			var totalPrice = 0.0;
			for (var i = 0; i < VISITORS_TARIFF_NUMB; i++) {
				var row = document.getElementById("today_visitors_tariff_table_row_" + String(visitorsTariff[i].number));
				row.cells[2].innerHTML = getAttendanceTime(visitorsTariff[i].arrivalTime);
				row.cells[3].innerHTML = getPriceByTraffic(visitorsTariff[i].arrivalTime) + " руб.";
				totalPrice += parseFloat(getPriceByTraffic(visitorsTariff[i].arrivalTime));
				var comment = document.getElementById("today_visitors_tariff_table_comment_" + String(visitorsTariff[i].number));
				visitorsTariff[i].comment = comment.value;
			}
			var visitorsTotalPrice = document.getElementById("visitors_tariff_log_total_price");
			visitorsTotalPrice.innerHTML = "<font class='textStyle2'>Итого: <b><u> " + totalPrice + "</u></b> руб.</font>";
		}

	function getCurrentActions() {
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_today_actions', false);
		request.send(null);
		return JSON.parse(request.responseText);
	}

	function viewCurrentActions() {
		var tr = 1;
		for (var i = 0; i < actions.length; i++) {
			var actionLog = document.getElementById("action_log");
			var newAction = document.createElement("div");
			newAction.id = "action_log_" + actions[i].id;
			newAction.className = "class_action_log";
			var actionTable = document.createElement("table");
			actionTable.id = "action_log_table_" + actions[i].id;
			actionTable.border = "1";
			actionTable.align = "center";
			actionTable.cellpadding = "0";
			actionTable.cellspacing = "0";
			var newRow = actionTable.insertRow(0);
			newRow.className = 'tr1';
			var newCell = newRow.insertCell(0);
			newCell.innerHTML = "Участник";
			newCell = newRow.insertCell(1);
			newCell.innerHTML = "Заплатил";
			newCell = newRow.insertCell(2);
			newCell.innerHTML = "Комментарий";
				
			for (var j = 0; j < actions[i].participants.length; j++) {
				newRow = actionTable.insertRow();
				newRow.className = "tr" + tr;
				tr == 1? tr = 2: tr = 1;
				newCell = newRow.insertCell(0);
				newCell.innerHTML = "Участник " + actions[i].participants[j].participant_id;;
				newCell = newRow.insertCell(1);
				newCell.innerHTML = "<input type='number' value='" + parseInt(actions[i].participants[j].price) + "' min='0' step='50'/>";
				newCell = newRow.insertCell(2);
				newCell.innerHTML = "<input size='20' class='input_comment' placeholder='Комментарий' name='comment' value='" + actions[i].participants[j].comment + "' />";
			}

			var caption = document.createElement("p");
			caption.align = "center";
			//
			///
			//
			//
			///
			//
			//
			//
			//Стоимость: " + actions[i].price +    а как же случай при by_tariff = True?
			//
			///
			//
			//
			//
			///
			//
			//
			//
			///
			//
			//
			caption.innerHTML = "<b>" + actions[i].name + ". Время начала:" + actions[i].start_time + ". Стоимость: " + actions[i].price + "</b>";
				
			var buttonsEnd_Add = document.createElement("div");
			buttonsEnd_Add.style.textAlign = "right";
			var json = new Object();
			json.id = actions[i].id;
			json.price = actions[i].price;
			json = JSON.stringify(json);
			buttonsEnd_Add.innerHTML = "<button type='button' onclick=endAction('" + actions[i].id + "')>Закончить</button><button type='button' onclick=addParticipant('" + actions[i].id + "')>+1 участник</button>"
				
			newAction.appendChild(caption);
			newAction.appendChild(actionTable);
			newAction.appendChild(buttonsEnd_Add);
			actionLog.appendChild(newAction);
		}
	}
	
	function endAction(actionID) {
		// Удаление мероприятия из таблицы TodayActions
		// Отправляем на сервер название мероприятия.  На сервере выполняется удаление всех записей с названием мероприятия
		var actionName = String(actions[actionID]['name']);
		var request =  new XMLHttpRequest();
		request.open('POST', '/del_today_action', false);
		request.send(actionName);
		
		// Добавление завершенных мероприятий в таблицу Actions
		var end_time = (new Date()).getTime();
		var JSONActionToServer = new Array();
		for (var i = 0; i < actions[actionID]['participants'].length; i++) {
			JSONActionToServer[i] = new Object(); // Формируем JSON-объект, содержащий всех участников мероприятия. Участник содержит:
			JSONActionToServer[i]['action_name'] = String(actionName); // a. Название мероприятия
			JSONActionToServer[i]['price'] = String(actions[actionID]['participants'][i]['price']); // b. Цена, которую заплатил участник
			JSONActionToServer[i]['participant_id'] = String(actions[actionID]['participants'][i]['participant_id']); // c.  Номер участника
			JSONActionToServer[i]['comment'] = String(actions[actionID]['participants'][i]['comment']); // d.  Комментарий к участнику
			JSONActionToServer[i]['start_time'] = String(actions[actionID]['start_time']); // e.  Время начала мероприятия
			JSONActionToServer[i]['end_time'] = String(end_time); // f.  Время окончания мероприятия
		}
		
		var request =  new XMLHttpRequest();
		request.open('POST', '/add_ended_action', false);
		request.send(JSON.stringify(JSONActionToServer));
		
		// Кладем деньги в кассу за каждого участника мероприятия
		for (var i = 0; i < actions[actionID]['participants'].length; i++) {
			var money = actions[actionID]['participants'][i]['price'];
			addMoneyToCash(money, actionName);
		}
			
		// Очистка лог-блока от лог-таблиц
		var elem = document.getElementById("action_log");
		var length = elem.children.length;
		for (var i = 0; i < length - 1; i++) {
			elem.removeChild(elem.children[1]);
		}

		//Освобождение памяти объекта actions
		for (var i = 0; i < actions.lenght; i++) {
			for (var j = 0; j < actions[i]['participants'].length; j++)
				actions[i]['participants'][j] = null;
			actions[i] = null;
		}
		
		// Переинициализация мероприятий, включая создания лог-таблицы мероприятий
		actions = getCurrentActions();
		initActionLog(actions); 
		document.getElementById("count_released_visitors").innerHTML = parseInt(getCountTodayReleasedVisitors());
		document.getElementById("current_money_in_cash").innerHTML = getCurrentMoneyInCash();
		document.getElementById("today_income").innerHTML = parseInt(getTodayIncome());
	}
	
	function viewReleasedVisitors() {
		var releasedVisitorsLog = document.getElementById("released_visitors_log");
		var strToLog = "";
		strToLog = '<div style="text-align: center;"><font class="textStyleCaption">Уже посетили нас</font></div>';
		strToLog += '<table border="1" cellpadding="1" cellspacing="1" align="center">';
		strToLog += '<tr class="th1"><td><b>Посетитель</b></td>	<td><b>Номерок</b></td>	<td><b>Прибыл</b></td>	<td><b>Пробыл</b></td>	<td><b>Заплатил</b></td>	<td><b>Комментарий</b></td></tr>';
		
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_released_visitors', false);
		request.send(null);
		var JSONVisitors = JSON.parse(request.responseText);
		var tr;
		JSONVisitors.length % 2 == 0? tr = 2: tr = 1;
		
		for (var i = 0; i < JSONVisitors.length; i++) {
				time1 = new Date(parseInt(JSONVisitors[i].arrival_time));
				time2 = new Date(parseInt(JSONVisitors[i].leaving_time));
			strToLog += "<tr class='tr" + tr + "'><td>Гость</td>	<td>" + JSONVisitors[i].number + "</td>	";
			strToLog += "<td>" +getArrivalTime(new Date(parseInt(JSONVisitors[i].arrival_time))) + "</td>	<td>" + getTimeDifference(time1, time2) + "</td>"; 
			strToLog +=  "<td>" +  JSONVisitors[i].price + " руб.</td>	<td>" +  JSONVisitors[i].comment + "</td></tr>";
			tr == 1? tr = 2: tr = 1;
		}
		strToLog += '</table>'
		
		request =  new XMLHttpRequest();
		request.open('POST', '/get_released_actions', false);
		var now_time = String((new Date()).getTime())
		request.send(now_time);
		var JSONActions = JSON.parse(request.responseText);
		strToLog += '<br><hr width="75%" color="#ffa500"><p align="center"><font class="textStyleCaption">Прошедшие мероприятия</font></p>';
		strToLog += '<table border="1"class="tableStyle1" align="center">';
		strToLog += '<tr class="th1"><td><b>Мероприятие</b></td>	<td><b>Участник</b></td>	<td><b>Начало</b></td>	<td><b>Конец</b></td>	<td><b>Заплачено</b></td>	<td><b>Комментарий</b></td></tr>';

		
		JSONActions.length % 2 == 0? tr = 2: tr = 1;
		for (var i = 0; i < JSONActions.length; i++) {
			var actionName = JSONActions[i].name;
			timeStart = new Date(parseInt(JSONActions[i]['start_time']));
			timeEnd = new Date(parseInt(JSONActions[i]['end_time']));
			strToLog += "<tr class='tr" + tr + "'><td style='word-break: break-all'>" + actionName + "</td>	<td>" + JSONActions[i]['participant_id'] + "</td>";
			strToLog += "<td>" +toLocaleRussianTime(timeStart) + "</td>	<td>" + toLocaleRussianTime(timeEnd) + "</td>"; 
			strToLog +=  "<td>" +  JSONActions[i]['price'] + " руб.</td>	<td style='word-break: break-all'>" + JSONActions[i]['comment'] + "</td></tr>";
			tr == 1? tr = 2: tr = 1;
		}
		strToLog += '</table>'
		releasedVisitorsLog.innerHTML = strToLog;
	}
		
	function toMilliseconds(timeHHMM) {
		var hours = parseInt(timeHHMM.slice(0,2));
		var minutes = parseInt(timeHHMM.slice(3,5));
		//alert("hours: " + hours + ". Minutes: " + minutes);
		var today = new Date();
		today.setHours(hours);
		today.setMinutes(minutes);
		//alert(today);
		return today.getTime();
	}

	function toLocaleRussianTime(date) {
		var month = date.getUTCMonth() + 1;
		var year = date.getUTCFullYear();
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var dateToString = "";
		dateToString = ""+ (day < 10 ? "0" + day : day) + "." + (month < 10 ? "0" + month : month) + "." + year + " " + (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
		return dateToString;
	}
	
	function changeComment(commentInput, actionID, participantID) {
		var participant = new Object();
		//alert(actionID);
		participant['action_name'] = actions[actionID]['name'];
		participant['comment'] = commentInput.value;
		participant['participant_id'] = String(participantID);
		
		actions[actionID]['participants'][participantID-1]['comment'] = String(participant['comment']);

		 var request =  new XMLHttpRequest();
		 request.open('POST', '/change_comment', false);
		 request.send(JSON.stringify(participant));
	}
	
	function changePrice(priceInput, actionID, participantID) {
		var participant = new Object();
		participant['action_name'] = actions[actionID]['name'];
		participant['price'] = String(priceInput.value);
		participant['participant_id'] = String(participantID);
		
		actions[actionID]['participants'][participantID-1]['price'] = parseInt(participant['price']);
		
		var request =  new XMLHttpRequest();
		request.open('POST', '/change_price', false);
		request.send(JSON.stringify(participant));
	}
	
	function initActionLog(actions) {
		for (var i = 0; i < actions.length; i++) {
			var actionLogElements = initActionLogElements(i, actions[i]);
			for (var j = 0; j < actions[i]['participants'].length; j++) {
				insertRowToActionLogTable(actionLogElements['table'], actions[i]['participants'][j], i)
			}
		}
	}
	
	function initActionLogElements(id, action) {
		var actionLogElement = new Object();
		actionLogElement['block'] = document.createElement("div");
		actionLogElement['table'] = document.createElement("table");
		actionLogElement['caption'] = document.createElement("p");
		actionLogElement['buttons_block'] = document.createElement("div");
		actionLogElement['total_price_block'] = document.createElement("div");
		
		actionLogElement['block']['id'] = "action_log_" + id;
		actionLogElement['block']['className'] = "class_action_log";
		
		actionLogElement['table']['id'] = "action_log_table_" + id;
		actionLogElement['table']['className'] = "class_action_log_table";
		actionLogElement['table']['border'] = "1";
		actionLogElement['table']['align'] = "center";
		actionLogElement['table']['cellpadding'] = "0";
		actionLogElement['table']['cellspacing'] = "0";
		var newRow = actionLogElement['table'].insertRow(0);
		newRow['className'] = "th1";
		var newCell = newRow.insertCell(0);
		newCell.innerHTML = "Участник";
		newCell = newRow.insertCell(1);
		newCell.innerHTML = "Заплатил";
		newCell = newRow.insertCell(2);
		newCell.innerHTML = "Комментарий";	
		
		actionLogElement['caption']['align'] = "center";
		actionLogElement['caption']['innerHTML'] = "<b>" + action['name'] + ". Время начала: " + toLocaleRussianTime(new Date(parseInt(action['start_time']))) + ". Стоимость: " + (String(action['by_tariff']).toUpperCase() == 'TRUE'  ? 'по тарифу' :  parseInt(action['price']) +" руб.") + "</b>";
		actionLogElement['caption']['className'] = "textStyleCaption";
		
		actionLogElement['buttons_block']['className'] = "action_buttons_block";
		actionLogElement['buttons_block']['innerHTML'] = "<button type='button' class='button_action_log' onclick=delAction('" + id + "')>Удалить мероприятие</button> <button type='button' class='button_action_log' onclick=endAction('" + id + "')>Закончить</button> <button type='button' class='button_action_log' onclick=addParticipant('" + id + "')>+1 участник</button>" 
		
		actionLogElement['total_price_block']['className'] = "action_total_price_block";
		actionLogElement['total_price_block']['id'] = 'action_total_price_block_' + id;
		
		var actionLog = document.getElementById("action_log");
		actionLogElement['block'].appendChild(actionLogElement['caption']);
		actionLogElement['block'].appendChild(actionLogElement['table']);
		actionLogElement['block'].appendChild(actionLogElement['buttons_block']);
		actionLogElement['block'].appendChild(actionLogElement['total_price_block']);
		actionLog.appendChild(actionLogElement['block']);
		
		return actionLogElement;
	}
	
	/* Функция, которая вставляет в лог-таблицу мероприятий строку с участником.
	В строке содержаться поля с комментариями и ценой. 
	Этим полям назначаются функции, которые записывают изменения значений полей в БД */
	function insertRowToActionLogTable(logTable, participant, actionID) {
		var tr;
		logTable.rows.length % 2 == 0? tr = 2: tr = 1;
		var newRow = logTable.insertRow();
		newRow.className = "tr" + tr;
		var newCell = newRow.insertCell(0);
		newCell['innerHTML'] = "Участник " + participant['participant_id'];
		newCell = newRow.insertCell(1);
		newCell.innerHTML = "<input type=\"number\" value=\"" + parseInt(participant['price']) + "\" min=\"0\" step=\"50\" class='input_action_log_price' onblur=changePrice(" + "this,\"" + actionID +  "\",\"" + participant['participant_id'] + "\") />";
		newCell = newRow.insertCell(2);
		newCell.innerHTML = '<input size="20" class="input_comment" placeholder="Комментарий" name="comment" value="' + participant['comment'] + '" onblur=changeComment(' + 'this,"' + actionID +  '","' + participant['participant_id'] + '") />';
	}
	
	function addParticipant(actionID) {
		// Создание JSON-объекта участника со значениями по умолчанию
		var defaultComment = "";
		var defaultPrice = parseInt(actions[actionID]['price']);

		var participants_count = parseInt(actions[actionID]['participants'].length);
		var JSONParticipantToActions = new Object();
		JSONParticipantToActions['price'] = defaultPrice;
		JSONParticipantToActions['comment'] = defaultComment;
		JSONParticipantToActions['participant_id'] = participants_count  + 1;
		
		// Присоединение JSON-объекта участника к JSON-оъекту actions
		actions[actionID]['participants'][participants_count] = JSONParticipantToActions;

		// Отправление JSON-объекта участника на сервер (для занесения в БД в таблицу  TodayActions)
		var JSONParticipantToServer = new Object();
		JSONParticipantToServer['action_name'] = actions[actionID]['name'];
		JSONParticipantToServer['comment'] = defaultComment;
		JSONParticipantToServer['start_time'] = String(actions[actionID]['start_time']);
		JSONParticipantToServer['by_tariff'] = String(actions[actionID]['by_tariff']);
		JSONParticipantToServer['participant_id'] = String(participants_count + 1);
		JSONParticipantToServer['price'] = String(defaultPrice);
			
		request = new XMLHttpRequest();
		request.open('POST', '/add_participant', false);
		request.send(JSON.stringify(JSONParticipantToServer));
		
		// Занесение в лог-таблицу с индексом actionID строку с данными и полями
		var logTable = document.getElementById("action_log_table_" + actionID);
		insertRowToActionLogTable(logTable, JSONParticipantToActions, actionID);
		updateActions();
	}

	function addAction() {
		// Проверка данных на валидацию данных
		var actionFormElements = document.getElementById("form_add_action");
		var isValidate = true;
		for (var i = 0; i < actionFormElements.length - 2; i++) {
			if (actionFormElements[i].value == "")
				isValidate = false;
		}
		if (actionFormElements[2].value > 1500 || actionFormElements[2].value < 0)
				isValidate = false;
		if (actionFormElements[3].value > 20 || actionFormElements[3].value < 0)
				isValidate = false;
		
		if (isValidate == false) {
			alert("Мероприятие не было добавлено. Вы что-то ввели не так! Страдайте!");
			return;
		}

		// Создание JSON-объекта участника
		var actionFormElements = document.getElementById('form_add_action').elements;
		var actions_count = actions.length;
		
		var action = new Object();
		action['name'] = String(actionFormElements['action_name'].value);
		action['price'] = parseInt(actionFormElements['price'].value);
		action['start_time'] = String(toMilliseconds(actionFormElements['start_time'].value));
		action['by_tariff'] = actionFormElements['checkbox_tariff'].checked;
		action['participants'] = new Array();
		for (var i = 0; i < parseInt(actionFormElements['participants_count'].value); i++) {
			action['participants'][i] = new Object();
			action['participants'][i]['price'] = action['price']
			action['participants'][i]['comment'] = "";
			action['participants'][i]['participant_id'] = parseInt(i+1);
		}
		
		// Присоединение JSON-объекта участника к мероприятиям actions
		actions[actions_count] = action;
		
		// Создание JSON-объекта мероприятия для отправки на сервер
		var JSONActionToServer = new Array();
		for (var i = 0; i < parseInt(actionFormElements['participants_count'].value); i++) {
			JSONActionToServer[i] = new Object();
			JSONActionToServer[i]['start_time'] = action['start_time'];
			JSONActionToServer[i]['price'] = String(action['price']);
			JSONActionToServer[i]['comment'] = "";
			JSONActionToServer[i]['by_tariff'] = String(action['by_tariff']);
			JSONActionToServer[i]['participant_id'] = String(i+1);
			JSONActionToServer[i]['name'] = action['name'];
		}
		
		// Отправление на сервер JSON-объекта мероприятия
		request =  new XMLHttpRequest();
		request.open('POST', '/add_action', false);
		request.send(JSON.stringify(JSONActionToServer));
		//alert("Ответ сервера: " + request.responseText);
		
		// Занесение мероприятия в блок лога мероприятий
		for (var i = actions.length - 1; i < actions.length; i++) {
			var actionLogElements = initActionLogElements(i, actions[i]);
			for (var j = 0; j < actions[i]['participants'].length; j++) {
				insertRowToActionLogTable(actionLogElements['table'], actions[i]['participants'][j], i)
			}
		}
		updateActions();
	}
	
	function endSession() {
		//Освобождение памяти объекта actions
		for (var i = 0; i < actions.lenght; i++) {
			for (var j = 0; j < actions[i]['participants'].length; j++)
				actions[i]['participants'][j] = null;
			actions[i] = null;
		}
		window.location = '/logout';
	}
	
	function addMoneyToCash(money, actionName) {
		var cashLog = new Object();
		cashLog['added_money'] = String(money);
		cashLog['comment'] = String('За "' + actionName + '"');
		cashLog['time_now'] = String((new Date()).getTime());
		request =  new XMLHttpRequest();
		request.open('POST', '/money_cash/add' , false);
		request.send(JSON.stringify(cashLog));
	}
	
	function moneyCash(addOrWithdraw) {
		var cashDeskForm = document.getElementById("cash_desk_form");
		var cashLog = new Object();
		if (addOrWithdraw == 'add')
			cashLog['added_money'] = String(cashDeskForm[0]['value']);
		else
			cashLog['withdrawed_money'] = String(cashDeskForm[0]['value']);
		cashLog['comment'] = String(cashDeskForm[1]['value']);
		cashLog['time_now'] = String((new Date()).getTime());
		cashDeskForm[0]['value'] = '';
		cashDeskForm[1]['value'] = '';
		request =  new XMLHttpRequest();
		request.open('POST', '/money_cash/' + addOrWithdraw, false);
		request.send(JSON.stringify(cashLog));
		
		document.getElementById("today_income").innerHTML = parseInt(getTodayIncome());
		document.getElementById("current_money_in_cash").innerHTML = parseInt(getCurrentMoneyInCash());
	}
	
	function updateActions() {
		for (var i = 0; i < actions.length; i++) {
			var actionTable = document.getElementById('action_log_table_' + i)
			var actionTotalPrice = document.getElementById('action_total_price_block_' + i);
			var totalPrice = 0;
			for (var j = 1; j < actionTable.rows.length; j++) {
				if (String(actions[i]['by_tariff']).toUpperCase() == "TRUE")
					actionTable.rows[j].cells[1].children[0].value = parseInt(getPriceByTraffic(new Date(parseInt(actions[i]['start_time']))));
				totalPrice += parseFloat(actionTable.rows[j].cells[1].children[0].value);
				changePrice(actionTable.rows[j].cells[1].children[0], String(i), String(j));
			}
			actionTotalPrice.innerHTML = '<font class="textStyle2">Итого: <b><u>' + totalPrice + '</u></b> руб.</font>';
		}
	}
	
	function viewCashLog() {
		var cashLogTable = document.getElementById("cash_log_table");
		var strToLog = "";
		strToLog = '<tr class="th1"><td>Снято</td><td>Добавлено</td><td>Время</td><td>Комментарий</td></tr>';
		
		var request =  new XMLHttpRequest();
		request.open('POST', '/get_cash_log', false);
		request.send(null);
		var JSONCashLog = JSON.parse(request.responseText);
		var tr = 1;
		
		for (var i = 0; i < JSONCashLog.length; i++) {
			var added = 0, 
				withdrawed = 0, 
				time =  toLocaleRussianTime(new Date(parseInt(JSONCashLog[i]['time'])));
			if (parseInt(JSONCashLog[i]['withdrawn']) > 0)
				added = parseInt(JSONCashLog[i]['withdrawn']);
			else 
				withdrawed = parseInt(JSONCashLog[i]['withdrawn']);
			
			strToLog += "<tr class='tr" + tr + "'><td>" + (-1)*withdrawed + " руб. </td>	<td>" + added + " руб. </td>	";
			strToLog += "<td>" + time + "</td>	<td>" + JSONCashLog[i]['comment'] + "</td></tr>"; 
			tr == 1? tr = 2: tr = 1;
		}
		cashLogTable.innerHTML = strToLog;
	}
	
	
	function delAction(actionID) {
		// Удаление мероприятия из таблицы TodayActions
		// Отправляем на сервер название мероприятия.  На сервере выполняется удаление всех записей с названием мероприятия
		var actionName = String(actions[actionID]['name']);
		var request =  new XMLHttpRequest();
		request.open('POST', '/del_today_action', false);
		request.send(actionName);
		
		// Очистка лог-блока от лог-таблиц
		var elem = document.getElementById("action_log");
		var length = elem.children.length;
		for (var i = 0; i < length - 1; i++) {
			elem.removeChild(elem.children[1]);
		}

		//Освобождение памяти объекта actions
		for (var i = 0; i < actions.lenght; i++) {
			for (var j = 0; j < actions[i]['participants'].length; j++)
				actions[i]['participants'][j] = null;
			actions[i] = null;
		}
		
		// Переинициализация мероприятий, включая создания лог-таблицы мероприятий
		actions = getCurrentActions();
		initActionLog(actions); 
		document.getElementById("count_released_visitors").innerHTML = parseInt(getCountTodayReleasedVisitors());
		document.getElementById("current_money_in_cash").innerHTML = getCurrentMoneyInCash();
		document.getElementById("today_income").innerHTML = parseInt(getTodayIncome());
	}