-- 插入示例文件数据
INSERT INTO files (name, size, path, created_at) VALUES
('示例文档.pdf', 1048576, 'documents/sample-document.pdf', NOW()),
('项目模板.zip', 5242880, 'templates/project-template.zip', NOW()),
('用户手册.docx', 2097152, 'manuals/user-manual.docx', NOW()),
('安装包.exe', 10485760, 'installers/setup-package.exe', NOW()),
('配置文件.json', 524288, 'configs/default-config.json', NOW());

-- 插入一些示例下载记录
INSERT INTO downloads (file_id, status, progress, started_at, completed_at) VALUES
(
  (SELECT id FROM files WHERE name = '示例文档.pdf' LIMIT 1),
  'completed',
  100,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '59 minutes'
),
(
  (SELECT id FROM files WHERE name = '项目模板.zip' LIMIT 1),
  'completed',
  100,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour 55 minutes'
);