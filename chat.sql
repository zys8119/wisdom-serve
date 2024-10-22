/**
查询历史记录
@query_history
*/

SELECT * FROM history;
/**
创建历史记录
@createHistory
*/

INSERT INTO history (id, create_time, creator_id, tenant_id, title, status) VALUES (NULL, NOW(), ?, ?, ?, 1);