import sqlite3


def create_db_tables():
    conn = sqlite3.connect('db.sqlite3')
    cur = conn.cursor()

    cur.execute("""CREATE TABLE IF NOT EXISTS users(
       userid INT PRIMARY KEY,
       fname TEXT,
       lname TEXT,
       gender TEXT);
    """)
    conn.commit()

    cur.execute("""INSERT INTO users(userid, fname, lname, gender) 
       VALUES('00001', 'Alex', 'Smith', 'male');""")
    conn.commit()
