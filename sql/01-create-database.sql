-- Chạy trong SSMS / Azure Data Studio với quyền tạo DB.
IF DB_ID(N'BaseBE') IS NULL CREATE DATABASE BaseBE;
GO
USE BaseBE;
GO
IF OBJECT_ID(N'dbo.Users',N'U') IS NULL
BEGIN
 CREATE TABLE dbo.Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL DEFAULT 'User',
  status BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
 );
END;
GO
-- Đăng ký qua API để password được hash bằng bcrypt; không lưu mật khẩu thô.
