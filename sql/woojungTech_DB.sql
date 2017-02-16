USE woojungTech;
ALTER DATABASE woojungTech CHARACTER SET = 'utf8' COLLATE = 'utf8_general_ci';

DROP TABLE admin;
CREATE TABLE admin(
	id VARCHAR(20) PRIMARY KEY,
    password VARCHAR(20) NOT NULL,
    name VARCHAR(15),
    userType VARCHAR(15) NOT NULL
);
INSERT INTO admin SET id='admin', password='1234', userType='admin', name='관리자';
	

DROP TABLE member;
CREATE TABLE member(
	id VARCHAR(20) PRIMARY KEY,
    password VARCHAR(20) NOT NULL,
    name VARCHAR(30) NOT NULL, 	
    userType VARCHAR(15) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(15)
);
SELECT * FROM member;


DROP TABLE customer;
CREATE TABLE customer(
	no INT(10) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30),
    type VARCHAR(20)
);
SELECT * FROM customer;

INSERT INTO customer SET name='유한양행';
INSERT INTO customer SET name='서울대병원';
INSERT INTO customer SET name='이화여대병원';
INSERT INTO customer SET name='대웅제약 향남';
DELETE FROM customer WHERE no=3;

DROP TABLE complaint;
CREATE TABLE complaint(
	no INT(10) AUTO_INCREMENT PRIMARY KEY,
    document_no VARCHAR(100),
    product VARCHAR(30) NOT NULL,
    customer_no INT(10) NOT NULL,
    customer_name VARCHAR(20),
    content VARCHAR(120) NOT NULL,
    state VARCHAR(50) NOT NULL,
    receipt_date VARCHAR(30) NOT NULL,
    visit_date VARCHAR(30),
    revisit_date VARCHAR(30),
    revisit_count VARCHAR(30),
    complete_date VARCHAR(30),
    charger VARCHAR(30),
    representative_charger VARCHAR(10),
    charger_phone VARCHAR(100),
    revisit_reason VARCHAR(120),
    customer_email VARCHAR(60),
    other_detail VARCHAR(120),
    customer_charger VARCHAR(30)
);

SELECT * FROM complaint;
INSERT INTO complaint SET product='오토클레이브, IVC', customer_no=1, customer_name='유한양행',
content='챔버 암력 알람 발생, 컨트롤 케이지 설치 문의', state='A/S 접수완료', receipt_date='2016년 9월 19일';

INSERT INTO complaint SET product='IWT 650GP 세척기', customer='대웅제약 향남',
content='세척기 하단 부분 누수 발생', state='A/S 접수완료', receipt_date= '2016년 12월 27일';
INSERT INTO complaint SET product='BIOQUELL', customer='유한양행',
content='아이솔레이터 압력 센서 보드 교체', state='A/S 접수완료', receipt_date= '2016년 12월 28일';

DELETE FROM complaint;




DROP TABLE schedule;
CREATE TABLE schedule (
    no INT(10) AUTO_INCREMENT PRIMARY KEY,
    start_date VARCHAR(15) NOT NULL,
    end_date VARCHAR(15) NOT NULL,
    customer_no INT(10),
    customer_name VARCHAR(200),
    charger VARCHAR(300),
    charger_name VARCHAR(300),
    manufacturer VARCHAR(20),
    work_type VARCHAR(20),
    equipment VARCHAR(20),
    serial_number VARCHAR(600),
    work_detail VARCHAR(200),
    work_delay VARCHAR(15),
    visit_type VARCHAR(30),
    revisit_count VARCHAR(20),
    changed_component VARCHAR(300),
    state VARCHAR(100),
    undecided_reason VARCHAR(200),
    file_path VARCHAR(300),
    final_writer VARCHAR(30),
    final_correction_time VARCHAR(30),
    failure VARCHAR(300),
    report_state VARCHAR(30),
    after_path VARCHAR(100),
    before_path VARCHAR(100)
);
ALTER TABLE schedule MODIFY charger VARCHAR(300);
ALTER TABLE schedule MODIFY charger_name VARCHAR(300);
ALTER TABLE schedule MODIFY serial_number VARCHAR(600);
ALTER TABLE schedule MODIFY customer_name VARCHAR(200);
ALTER TABLE schedule MODIFY changed_component VARCHAR(300);
ALTER TABLE schedule MODIFY state VARCHAR(100);

ALTER TABLE schedule ADD failure VARCHAR(300);
ALTER TABLE schedule ADD report_state VARCHAR(30);

ALTER TABLE schedule ADD after_path VARCHAR(100);
ALTER TABLE schedule ADD before_path VARCHAR(100);


SELECT * FROM schedule;
INSERT INTO schedule SET start_date='2017-02-01', end_date='2017-02-18',customer_no=1, charger='임유진', 
manufacturer='인텔', work_type='유상유지보수', equipment='L2', serial_number='#124151a', 
work_detail='이러쿵저러쿵해서 처리하고 이러쿵 저러쿵해서 모든 문제점을 완벽하게 처리할수있도록 노력하였으나 실패', work_delay='1시간';

UPDATE schedule SET report_state='send' WHERE no=310;


DROP TABLE code;
CREATE TABLE code(
	code_no INT(10) AUTO_INCREMENT PRIMARY KEY,
    code_name VARCHAR(20),
    code_type VARCHAR(15),
    code_desc VARCHAR(150)
);

select * from code WHERE code_type='업무구분' OR code_type='미결사유';


DROP TABLE address_book;
CREATE TABLE address_book(
	email VARCHAR(150) PRIMARY KEY,
	name VARCHAR(30),
    customer_name VARCHAR(100),
    phone VARCHAR(50)
);

select * from address_book;

DROP TABLE equipment;
CREATE TABLE equipment(
	id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(300),
    manufacturer VARCHAR(300),
    code_no INT(20),
    register_date VARCHAR(50)
);

SELECT * FROM equipment;



DELETE FROM customer where no>=1;
select * from customer;
INSERT INTO customer SET no=102, name='이화여대', type='학교/연구소';



LOAD DATA LOCAL INFILE 'E:/cus1_02031055.csv'
INTO TABLE ndy766.customer 
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
(no, name, type); 


DROP TABLE complaint_report;
CREATE TABLE complaint_report(
	no INT(10) PRIMARY KEY AUTO_INCREMENT,
	document_no VARCHAR(100),
    subject VARCHAR(200),
    sender VARCHAR(150),
    write_date VARCHAR(150),
    inspection_start_date VARCHAR(150),
    inspection_end_date VARCHAR(150),
    writer VARCHAR(100),
    writer_phone VARCHAR(100),
    customer_name VARCHAR(300),
    receiver VARCHAR(100),
    receiver_phone VARCHAR(100),
    equipment VARCHAR(200),
    place VARCHAR(200),
    failure VARCHAR(300),
    work_detail VARCHAR(600),
    email VARCHAR(200),
    before_path VARCHAR(150),
    after_path VARCHAR(150),
    schedule_no VARCHAR(100)
);




