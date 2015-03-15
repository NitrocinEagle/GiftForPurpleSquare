from app import db

ROLE_USER = 0
ROLE_ADMIN = 1

# class Groups_Servers(db.Model):    
#    group_ID = db.Column(db.String(64), primary_key = True)
#    server_ID = db.Column(db.String(64), primary_key = True)
#    def __repr__(self):
#        return '<Group %s - %s>' % (self.group_ID, self.server_ID)

class Numbers(db.Model):
	number = db.Column(db.Integer, primary_key = True)

class Actions(db.Model):
	action = db.Column(db.String(64), primary_key = True)

class TodayVisitors(db.Model):
	number = db.Column(db.Integer, primary_key = True)
	arrival_time = db.Column(db.String(8), primary_key = False)
	
class Visitors(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#	number = db.Column(db.Integer, primary_key = True, default=0)
	arrival_time = db.Column(db.String(20), primary_key = False, default="00:00:0000:00:00:00")
	leaving_time = db.Column(db.String(20), primary_key = False, default="00:00:0000:00:00:00")
	action = db.Column(db.String(64), primary_key = False, default="just guest")
	price = db.Column(db.Integer, primary_key = False, default=0)