/**
获取表单列表
@list
*/
SELECT * FROM design_form WHERE STATUS = 1 and title LIKE ?  LIMIT ?,?;
/**
获取表单列表
@listTotal
*/
SELECT COUNT(*) FROM design_form WHERE STATUS = 1 and title LIKE ? GROUP BY 'id';