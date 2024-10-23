/**
查询历史记录
@query_history
*/

SELECT title, id, create_time FROM history WHERE creator_id = ? and tenant_id = ? and status = 1;
/**
创建历史记录
@createHistory
*/
INSERT INTO history (id, create_time, creator_id, tenant_id, title, status) VALUES (?, NOW(), ?, ?, ?, 1);
/**
创建会话token
@getChatToken
*/
INSERT INTO chat_token (id, chat_id, create_time, token,message, status) VALUES (null,?, NOW(), ?, ?, 1);
/**
根据会话toke查询会话信息
@query_chat_info_by_token
*/
select * FROM chat_token WHERE token = ? and status = 1;
/**
根据回话id查询历史会话信息
@query_chat_history_by_chat_id
*/
select * FROM chat_history WHERE chat_id = ? and status = 1 ORDER BY create_time;
/**
创建聊天历史记录
@createChatHistory
*/
INSERT INTO chat_history (id, chat_id, create_time,message, role, status) VALUES (?, ?, NOW(), ?,?, 1);
/**
更新聊天token状态
@update_chat_token_status
*/
UPDATE chat_token set status = 0  WHERE token = ?;