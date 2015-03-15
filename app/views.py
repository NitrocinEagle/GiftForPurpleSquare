from flask import render_template, flash, redirect, jsonify, request
from app import app,db,models
import json

@app.route('/', methods = ['GET', 'POST'])
@app.route('/index')
def index():
	return render_template('index.html', title = 'Sign In')

@app.route('/todayvisitors', methods = ['POST'])
def todayvisitors():	
	data = []
	today_visitors = models.TodayVisitors.query.all()
	for visitor in today_visitors:
		data.append({'number' : str(visitor.number), 'arrival_time' : str(visitor.arrival_time)})
	return json.dumps(data)
	
#	data = {}
#	today_visitors = models.TodayVisitors.query.all()
#	for visitor in today_visitors:
#		print str(visitor.number)
#		data["number"] = str(visitor.number)
#		data["arrival_time"] = str(visitor.arrival_time)	
#	json_today_visitors = json.dumps(data)
	#a = json.loads(request.data)
	#return a['number']#json_today_visitors#a['number']


@app.route('/addvisitor', methods = ['POST'])
def addvisitor():
	visitor = json.loads(request.data)
#	print 'visitor = ',visitor	
	new_visitor = models.Visitors(price=int(visitor['price']), action=visitor['action'])
	db.session.add(new_visitor)
	db.session.commit()
	return 'Successes'

@app.route('/releaseguest/<guest_number>', methods = ['POST'])
def releaseguest(guest_number):
	guest = models.TodayVisitors.query.get(int(guest_number))
	db.session.delete(guest)
	db.session.commit()
	return "Success!:)"

@app.route('/addguest', methods = ['POST'])
def addguest():
	guest = json.loads(request.data)
	new_guest = models.TodayVisitors(number=int(guest['number']), arrival_time=str(guest['arrival_time']))
	db.session.add(new_guest)
	db.session.commit()
	return guest['number']