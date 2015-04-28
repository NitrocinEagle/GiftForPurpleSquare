# -*- coding: utf-8 -*-
from flask import render_template, flash, redirect, jsonify, request, Flask, url_for
from app import app, db, models, lm
from flask import render_template, flash, redirect, session, url_for, request, g
from flask.ext.login import login_user, logout_user, current_user, login_required
from forms import LoginForm
from models import User, ROLE_USER, ROLE_ADMIN
import json, hashlib
from datetime import datetime, date, time
import datetime, time
import xlsxwriter

@app.route('/admin', methods = ['GET', 'POST'])
@login_required
def admin():
	if not g.user.is_authenticated():
		return redirect(url_for('login'))
	admin = ''
	if g.user.role == ROLE_ADMIN:
		return render_template('admin.html')
	return render_template('index.html')

@app.route('/', methods = ['GET', 'POST'])
@app.route('/index')
@login_required
def index():
	if not g.user.is_authenticated():
		return redirect(url_for('login'))
	administrator = g.user.nickname
	admin = ''
	if g.user.role == ROLE_ADMIN:
		admin = g.user.nickname
	return render_template('index.html', administrator = administrator, admin = admin)

@app.route('/add_today_visitor_tariff', methods = ['POST'])
def add_today_visitor_tariff():
	visitor = json.loads(request.data)
	new_visitor_tariff = models.TodayVisitors(number=int(visitor['number']), arrival_time=str(visitor['arrivalTime']))
	db.session.add(new_visitor_tariff)
	db.session.commit()
	return 'Посетитель (по тарифу) с номером ' + str(visitor['number']) + ' в список текущих посетителей добавлен. Время прибытия в мс: ' + str(visitor['arrivalTime'])

@app.route('/addtodayvisitor', methods = ['POST'])
def addtodayvisitor():
	visitor = json.loads(request.data)
	new_visitor = models.TodayVisitors(number = int(visitor['number']), action=visitor['action'], price = int(visitor['price']), arrival_time = str(visitor['arrivalTime']))
	db.session.add(new_visitor)
	db.session.commit()
	return u'Посетитель на мероприятие ' + visitor['action'] + u'добавлен в список текущих посетителей. Стоимость: ' + str(visitor['price']) + u' рублей.'

@app.route('/release_visitor_tariff/<guest_number>', methods = ['POST'])
def releaseguest(guest_number):
	guest = models.TodayVisitors.query.filter_by(number=guest_number).first()
	if not (guest is None):
		db.session.delete(guest)
		db.session.commit()
		return "Счет цены гостя под номером " + str(guest_number) + " остановлен!"
	else:
		return "Гостя под номером " + str(guest_number) + " нет!"

@app.route('/get_today_visitors_tariff', methods = ['POST'])
def get_today_visitors_tariff():
	data = []
	today_visitors_tariff = models.TodayVisitors.query.order_by('number asc').all()
	for visitor in today_visitors_tariff:
		data.append({'number' : str(visitor.number), 'arrivalTime' : str(visitor.arrival_time), 'comment': visitor.comment})
	return json.dumps(data)

@app.route('/add_visitor_tariff', methods = ['POST'])
def addvisitor():
	visitor = json.loads(request.data)
	new_visitor = models.Visitors(price=float(visitor['price']), comment=unicode(visitor['comment']), number=int(visitor['number']), arrival_time = str(visitor['arrivalTime']), leaving_time = str(visitor['leavingTime']))
	db.session.add(new_visitor)
	db.session.commit()
	return 'Success!'
	
@app.route('/releasevisitor/<visitor_number>,<visitor_action>', methods = ['POST'])
def releasevisitor(visitor_number, visitor_action):
	visitor = models.TodayVisitors.query.filter_by(number=visitor_number, action=visitor_action).first()
	if not (visitor is None):
		db.session.delete(visitor)
		db.session.commit()
		return u'Посетитель меропрития ' + visitor.action + u' с номером ' + str(visitor.number) + u' был удален'
	return 'Ошибочка! Нет такого посетителя'

@app.route('/allvisitors', methods = ['POST'])
def allvisitors():
	data = []
	allVisitors = models.Visitors.query.all()
	for visitor in allVisitors:
		if visitor.action != "Guest":
			data.append({'number' : str(visitor.number)})
	return json.dumps(data)

@lm.user_loader
def load_user(id):
	return User.query.get(int(id))

@app.route('/login', methods = ['GET', 'POST'])
def login():
	error = 'false'
	form = LoginForm()
	if form.validate_on_submit():
		user = models.User.query.filter_by(nickname=form.username.data).filter_by(password=hashlib.md5(form.password.data).hexdigest()).first()
		if user:
			cash = models.Info.query.get(1)
			time_now = str(int(round(time.time() * 1000)))
			if cash == None:
				cash = models.Info(money = int(form.money_in_cash.data), session_start = time_now, today_check = int(form.max_check.data))
				db.session.add(cash)
			else:
				cash.money = int(form.money_in_cash.data)
				cash.session_start = time_now
				cash.today_check = int(form.max_check.data)
			db.session.commit()
			flash('Autorization!')
			login_user(user, remember = True)
			return redirect('/index')
		else:
			error = 'true'
	form.set_default_money()
	return render_template('login.html', error = error, form = form)

@app.route('/logout', methods = ['GET'])
def logout():
	today_actions = models.TodayActions.query.all()
	for action in today_actions:
		db.session.delete(action)
	
	today_visitors_tariff = models.TodayVisitors.query.delete()
	db.session.commit()
	
	print u'Завершение смены'
	print u'На начало смены в кассе было ' + str(models.Info.query.get(1).money) + u' рублей'
	money_in_cash = int(models.Info.query.get(1).money)
	cash_log = models.CashLog.query.all()
	for log in cash_log:
		money_in_cash += int(log.withdrawn)
		print u'Добавили(Забрали) ' + str(log.withdrawn) + u' рублей. Стало ' + str(money_in_cash) + u' рублей'
	#models.Info.query.get(1).money = money_in_cash
	print u'Теперь в кассе ' + str(money_in_cash) + u' рублей'

	logout_user()
	return redirect(url_for('index')) 

@app.before_request
def before_request():
	g.user = current_user

@app.route('/get_count_released_visitors', methods = ['POST'])
def get_count_released_visitors():
	count_released_visitors = 0
	time_now = str(int(round(time.time() * 1000)))
	session_start_time = str(models.Info.query.get(1).session_start)
	visitors = models.Visitors.query.all()
	for v in visitors:
		if session_start_time < str(v.arrival_time) < time_now:
			count_released_visitors +=1
	participants = models.Actions.query.all()
	for part in participants:
		if session_start_time < str(part.start_time) < time_now:
			count_released_visitors +=1
	return str(count_released_visitors)

@app.route('/get_cash_money', methods = ['POST'])
def get_cash_money():
	return str(models.Info.query.get(1).money)

@app.route('/get_today_income', methods = ['POST'])
def get_today_income():
	total_income = 0
	session_start_time = str(models.Info.query.get(1).session_start)
	time_now = str(int(round(time.time() * 1000)))
	
	# Считается выручка с мероприятий
	money_incomes_and_outcomes = models.CashLog.query.all()
	for i in money_incomes_and_outcomes:
		if session_start_time < str(i.time) < time_now:
			total_income += i.withdrawn
	
	# Считается выручка от посетителей по тарифу
	# Беда в том, что посетитель может заплатить цену, не являющуюся целой. Т.е. 1,5 рубля, 151,5 рубля. 
	# По-хорошему нужно теперь все деньги переводить в строки, а это долго.
	# Поэтому пока что будем делать так: 
	# ищем в таблице всех посетителей по тарифу тех, кто пришел сегодня, суммируем их плату во float, а затем округляем до int в меньшую сторону 
	# Таким образом мы можем потерять 50 копеек за одного посетителя
	#total_income_float = 0.00
	#visitors = models.Visitors.query.all()
	#for vis in visitors:
	#	if session_start_time < str(vis.arrival_time) < time_now:
	#		total_income_float += vis.price
	#total_income += int(round(total_income_float))
	
	return str(total_income)

@app.route('/get_released_visitors', methods = ['GET', 'POST'])
def get_released_visitors():
	data = []
	released_visitors = models.Visitors.query.all()
	time_now = str(int(round(time.time() * 1000)))
	session_start_time = str(models.Info.query.get(1).session_start)
	for visitor in released_visitors:
		if session_start_time  < str(visitor.arrival_time) < time_now:
			data.append({ 'number'  : str(visitor.number), 'comment' : visitor.comment, 'arrival_time' : str(visitor.arrival_time),	'leaving_time' : str(visitor.leaving_time), 'price' : str(visitor.price)})
	return json.dumps(data)


# Функция, которая добавляет событие, в котором есть участники. Каждый участник заносится в БД
@app.route('/add_action', methods = ['POST'])
def add_action():
	participants = []
	action = json.loads(request.data)	
	for participant in action:
		by_tariff = True
		if participant['by_tariff'] == 'false':
			by_tariff = False
		participants.append({
			'name'  : participant['name'], 
			'start_time' : str(participant['start_time']), 
			'by_tariff' : by_tariff, 
			'participant_id' : int(participant['participant_id']), 
			'price' : int(participant['price']), 
			'comment' : participant['comment']
		})
	for participant in participants:
		particpnt = models.TodayActions( name =  participant['name'], start_time = str(participant['start_time']), by_tariff = participant['by_tariff'], participant_id = int(participant['participant_id']), price = int(participant['price']), comment =  participant['comment'])
		print 'DEBUG ' + str(participant['by_tariff'])
		db.session.add(particpnt)
	db.session.commit()
	return 'Success!'

@app.route('/del_today_action', methods = ['POST'])
def del_today_action():
	action_name = request.data.decode('utf8');
	participants = models.TodayActions.query.filter_by(name = action_name)
	for participant in participants:
		db.session.delete(participant)
	db.session.commit()
	return 'Success!'

@app.route('/add_ended_action', methods = ['POST'])
def add_ended_action():
	participants = json.loads(request.data)
	for participant in participants:
		prtcpnt = models.Actions(participant_id = int(participant['participant_id']), name = participant['action_name'], start_time = str(participant['start_time']), end_time = str(participant['end_time']), price = int(participant['price']), comment = participant['comment'])
		db.session.add(prtcpnt)
	db.session.commit()
	return 'Success!'

@app.route('/get_released_actions', methods = ['POST'])
def get_released_actions():
	now_time = request.data
	session_info = models.Info.query.all()
	sesstion_start_time = session_info[0].session_start
	actions = []
	released_actions = models.Actions.query.all()
	for participant in released_actions:
		if str(sesstion_start_time) < str(participant.start_time) < str(now_time):
			actions.append({ 'participant_id'  : str(participant.participant_id), 'comment' : participant.comment, 'price' : participant.price, 'start_time' : str(participant.start_time), 'end_time' : str(participant.end_time), 'name' :  participant.name})
	return json.dumps(actions)

@app.route('/add_participant', methods = ['POST'])
def add_participant():
	participant = json.loads(request.data)
	by_tariff = True
	if (participant['by_tariff']).upper() == 'FALSE':
		by_tariff = False
	prtcpnt = models.TodayActions(
		participant_id = int(participant['participant_id']), 
		name = participant['action_name'],  
		by_tariff = by_tariff,
		start_time = str(participant['start_time']), 
		price = int(participant['price']), 
		comment = participant['comment']
	)
	db.session.add(prtcpnt)
	db.session.commit()
	return 'Success'

@app.route('/change_comment', methods = ['POST'])
def change_comment():
	json_participant = json.loads(request.data)
	participant = models.TodayActions.query.filter_by(name = json_participant['action_name'], participant_id = int(json_participant['participant_id'])).first()
	participant.comment = json_participant['comment']
	db.session.commit()
	return 'Success'

@app.route('/change_price', methods = ['POST'])
def change_price():
	json_participant = json.loads(request.data)
	participant = models.TodayActions.query.filter_by(name = json_participant['action_name'], participant_id = int(json_participant['participant_id'])).first()
	participant.price = int(json_participant['price'])
	db.session.commit()
	return 'Success'

@app.route('/get_today_actions', methods = ['POST'])
def get_today_actions():
	actions_name_set = set()
	today_actions = models.TodayActions.query.all()
	for action in today_actions:
		actions_name_set.add(action.name)

	actions = []
	for action_name in actions_name_set:
		actions.append({
			'name'  : action_name, 
			'price' : 0, 
			'by_tariff' : False,
			'start_time' : '0', 
			'participants' : []
		})
		
	for action  in today_actions:
		for i in range(len(actions)):
			if actions[i]['name'] ==  action.name:
				actions[i]['name'] =  action.name
				actions[i]['price'] = str(action.price)
				actions[i]['by_tariff'] = str(action.by_tariff)
				actions[i]['start_time'] = str(action.start_time)
				actions[i]['participants'].append({
					'comment' : action.comment, 
					'price' : str(action.price), 
					'participant_id' : str(action.participant_id)
				})
				break
	return json.dumps(actions)

@app.route('/money_cash/<add_or_withdraw>', methods = ['POST'])
def money_cash(add_or_withdraw):
	cash_log = json.loads(request.data)
	withdraw = 0
	if (add_or_withdraw == 'add'):
		withdraw = int(cash_log['added_money'])
	else:
		withdraw = -1*int(cash_log['withdrawed_money'])
	new_cash_log = models.CashLog(withdrawn = withdraw, comment = cash_log['comment'], time = cash_log['time_now'])
	db.session.add(new_cash_log)
	
	cash = models.Info.query.get(1)
	cash.money = cash.money + withdraw
	db.session.commit()
	return 'Success'

@app.route('/get_max_check', methods = ['POST'])
def get_max_check():
	return str(models.Info.query.get(1).today_check)

@app.route('/change_comment_tariff_visitor/<visitor_number>', methods = ['POST'])
def change_comment_tariff_visitor(visitor_number):
	comment = request.data.decode('utf-8')
	visitor = models.TodayVisitors.query.filter_by(number = visitor_number).first()
	visitor.comment = comment
	db.session.commit()
	return 'Success'

@app.route('/get_cash_log', methods = ['POST'])
def get_cash_log():
	data = []
	session_info = models.Info.query.all()
	sesstion_start_time = session_info[0].session_start
	cash_log = models.CashLog.query.all()
	for log in cash_log:
		if str(sesstion_start_time) < str(log.time):
			data.append({ 
				'withdrawn'  : str(log.withdrawn), 
				'time' : str(log.time),
				'comment' : log.comment
			})
	return json.dumps(data)

# 1. Вывод статистики в xls-Файл. В статистике: Посетитель, Время прибытия, Время ухода, Сколько пробыл, Сколько заплатил, Комментарий 

@app.route('/get_session_start_time', methods = ['POST'])
def get_session_start_time():
	sesstion_start_time = models.Info.query.get(1).session_start
	return str(sesstion_start_time)

@app.route('/get_statistic', methods = ['POST'])
def get_statistic():
	time = json.loads(request.data)
	statistic = []
	actions = models.Actions.query.all()
	visitors = models.Visitors.query.all()
	cash_log = models.CashLog.query.all()
	
	for log in cash_log:
		if time['from'] < str(log.time) < time['to']:
			if log.withdrawn < 0:
				print u'Снято : ' + str((-1)*log.withdrawn) + u' рублей. За ' + log.comment
			else:
				print u'Добавлено : ' + str(log.withdrawn) + u' рублей. За ' + log.comment
	
	for action in actions:
		if time['from'] < str(action.start_time) < time['to']:
			statistic.append ({
				'visitor' : u'Участник ' + str(action.participant_id) + u' мероприятия "' + action.name + '"',
				'arrival_time' : str(action.start_time),
				'leaving_time' : str(action.end_time),
				'attendance_time' : str(int(action.end_time) - int(action.start_time)),
				'paid' : str(action.price),
				'comment': action.comment
			})
			
	for visitor in visitors:
		if time['from'] < str(visitor.arrival_time) < time['to']:
			statistic.append ({
				'visitor' : 'Гость с номерком ' + str(visitor.number),
				'arrival_time' : str(visitor.arrival_time),
				'leaving_time' : str(visitor.leaving_time),
				'attendance_time' : str(int(visitor.leaving_time) - int(visitor.arrival_time)),
				'paid' : str(visitor.price),
				'comment': visitor.comment
			})
	return json.dumps(statistic)


@app.route('/make_report', methods = ['POST'])
def download_report():
	time = json.loads(request.data)
	statistic = []
	actions = models.Actions.query.all()
	visitors = models.Visitors.query.all()
	cash_log = models.CashLog.query.all()
	
	
#	for log in cash_log:
#		if time['from'] < str(log.time) < time['to']:
#			if log.withdrawn < 0:
#				print u'Снято : ' + str((-1)*log.withdrawn) + u' рублей. За ' + log.comment
#			else:
#				print u'Добавлено : ' + str(log.withdrawn) + u' рублей. За ' + log.comment
	
	for action in actions:
		if time['from'] < str(action.start_time) < time['to']:
			statistic.append ({
				'visitor' : u'Участник ' + str(action.participant_id) + u' мероприятия "' + action.name + '"',
				'arrival_time' : str(action.start_time),
				'leaving_time' : str(action.end_time),
				'attendance_time' : str(int(action.end_time) - int(action.start_time)),
				'paid' : str(action.price),
				'comment': action.comment
			})
			
	for visitor in visitors:
		if time['from'] < str(visitor.arrival_time) < time['to']:
			statistic.append ({
				'visitor' : u'Гость с номерком ' + str(visitor.number),
				'arrival_time' : str(visitor.arrival_time),
				'leaving_time' : str(visitor.leaving_time),
				'attendance_time' : str(int(visitor.leaving_time) - int(visitor.arrival_time)),
				'paid' : str(visitor.price),
				'comment': visitor.comment
			})
			
	money_in_cash_end = models.Info.query.get(1).money
	money_in_cash_start = models.Info.query.get(1).money
	for log in cash_log:
		if time['from'] < str(log.time) < time['to']:
			money_in_cash_start -= log.withdrawn
	today_income = money_in_cash_end - money_in_cash_start
	
	# Create a workbook and add a worksheet.
	workbook = xlsxwriter.Workbook('reports/' + str(time['fromDate']) + '.' + str(time['fromMonth']) + '.' + str(time['fromYear']) + ' ' +  str(time['fromHours']) + ':' + str(time['fromMinutes']) + ' - ' + str(time['toDate']) + '.' + str(time['toMonth']) + '.' + str(time['toYear']) + ' ' +  str(time['toHours']) + ':' + str(time['toMinutes']) + '.xls')
	worksheet = workbook.add_worksheet()

	# Merge 3 cells.
	format_cash = workbook.add_format({'bold': True, 'border' : True, 'align': 'left', 'valign' : 'vcenter'})
	worksheet.merge_range('A1:B1', u'Денег в кассе на начало смены', format_cash)
	worksheet.merge_range('A2:B2', u'Денег в кассе на момент закрытия смены', format_cash)
	worksheet.merge_range('A3:B3', u'Выручка за смену', format_cash)
	worksheet.write(0, 2, money_in_cash_start, format_cash)
	worksheet.write(1, 2, money_in_cash_end, format_cash)
	worksheet.write(2, 2,  '=C2-C1', format_cash)
	
	
	worksheet.merge_range('A5:F5', u'Статистика по посетителям', workbook.add_format({'bold': True, 'border' : True, 'align': 'center', 'valign' : 'vcenter'}))
	
	worksheet.set_column(0, 0, 30)  # Width of column A set to 30.
	worksheet.set_column(1, 4, 18)  # Width of columns B:E set to 30.
	worksheet.set_column(5, 5, 30)  # Width of columns B:C set to 30.
	
	formatH = workbook.add_format()
	formatH.set_text_wrap(True)
	formatH.set_border()
	formatH.set_bold()
	formatH.set_align('center')
	formatH.set_align('vcenter')
	
	# Start from the first cell. Rows and columns are zero indexed.
	row = 5
	worksheet.write(row, 0, u'Посетитель', formatH)
	worksheet.write(row, 1, u'Время прибытия', formatH)
	worksheet.write(row, 2, u'Время ухода', formatH)
	worksheet.write(row, 3, u'Сколько пробыл', formatH)
	worksheet.write(row, 4, u'Сколько заплатил', formatH)
	worksheet.write(row, 5, u'Комментарий', formatH)

	row = 6
	
	formatRecord = workbook.add_format()
	formatRecord.set_text_wrap(True)
	formatRecord.set_border()
	formatRecord.set_align('center')
	formatRecord.set_align('vcenter')

	for i in statistic:
		worksheet.write(row, 0, i['visitor'], formatRecord)
		worksheet.write(row, 1, timestamp_to_time_string(i['arrival_time']), formatRecord)
		worksheet.write(row, 2, timestamp_to_time_string(i['leaving_time']), formatRecord)
		#worksheet.write(row, 3, timestamp_diff_totime_string(i['attendance_time']), formatRecord)
		worksheet.write(row, 3, timestamp_diff_totime_string(i['attendance_time']), formatRecord)
		worksheet.write(row, 4, i['paid'], formatRecord)
		worksheet.write(row, 5, i['comment'], formatRecord)
		row += 1
	
	row += 1
	worksheet.merge_range(row, 0, row, 5, u'Операции с кассой', workbook.add_format({'bold': True, 'border' : True, 'align': 'center', 'valign' : 'vcenter'}))
	row += 1
	worksheet.write(row, 0, u'Добавлено', formatH)
	worksheet.write(row, 1, u'Снято', formatH)
	worksheet.write(row, 2, u'Было', formatH)
	worksheet.write(row, 3, u'Стало', formatH)
	worksheet.write(row, 4, u'Время', formatH)
	worksheet.write(row, 5, u'Комментарий', formatH)
	
	row +=1
	money_in_cash_was = money_in_cash_start
	for log in cash_log:
		if time['from'] < str(log.time) < time['to']:
			if log.withdrawn > 0:
				worksheet.write(row, 0, log.withdrawn, formatRecord)
				worksheet.write(row, 1, 0, formatRecord)
			else:
				worksheet.write(row, 0, 0, formatRecord)
				worksheet.write(row, 1, (-1)*log.withdrawn, formatRecord)
			worksheet.write(row, 2, money_in_cash_was, formatRecord)
			money_in_cash_was += log.withdrawn
			money_in_cash_now = money_in_cash_was
			worksheet.write(row, 3, money_in_cash_now, formatRecord)
			worksheet.write(row, 4, timestamp_to_time_string(log.time), formatRecord)
			worksheet.write(row, 5, log.comment, formatRecord)
			row +=1

	workbook.close()
	return '1234'


def timestamp_to_time_string(timestamp):
	time_str = datetime.datetime.fromtimestamp(int(timestamp)/1000).isoformat()
	time_str = time_str[:-3]
	time_str = time_str.replace('T',' ')
	return time_str

def timestamp_diff_totime_string(timestamp):
	seconds = int(timestamp) / 1000
	minutes = seconds / 60 % 60
	hours = minutes / 24 % 24
	if hours < 10:
		hours = '0' + str(hours)
	if minutes < 10:
		minutes = '0' + str(minutes)
	time_str = str(hours) + ':' + str(minutes)
	return time_str