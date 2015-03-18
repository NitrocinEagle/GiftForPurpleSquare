from app import db

ROLE_USER = 0
ROLE_ADMIN = 1

# class Groups_Servers(db.Model):    
#    group_ID = db.Column(db.String(64), primary_key = True)
#    server_ID = db.Column(db.String(64), primary_key = True)
#    def __repr__(self):
#        return '<Group %s - %s>' % (self.group_ID, self.server_ID)

# class Numbers(db.Model):
#	number = db.Column(db.Integer, primary_key = True)

# class Actions(db.Model):
#	action = db.Column(db.String(64), primary_key = True)

class TodayVisitors(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	number = db.Column(db.Integer, primary_key = False, default=0)
	action = db.Column(db.String(64), primary_key = False, default="just guest")
	price = db.Column(db.Integer, primary_key = False, default=0)
	arrival_time = db.Column(db.String(16), primary_key = False)
	
class Visitors(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	number = db.Column(db.Integer, primary_key = False, default=0)
	action = db.Column(db.String(64), primary_key = False, default="Guest")
	arrival_time = db.Column(db.String(16), primary_key = False)
	leaving_time = db.Column(db.String(16), primary_key = False)
	price = db.Column(db.Float, primary_key = False, default=0)