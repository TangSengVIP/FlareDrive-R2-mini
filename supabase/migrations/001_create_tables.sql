-- 创建文件表
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建下载记录表
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_downloads_file_id ON downloads(file_id);
CREATE INDEX idx_downloads_status ON downloads(status);

-- 授权访问权限
GRANT SELECT ON files TO anon;
GRANT SELECT ON downloads TO anon;
GRANT ALL PRIVILEGES ON files TO authenticated;
GRANT ALL PRIVILEGES ON downloads TO authenticated;