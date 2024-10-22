/*
获取会议基本信息
@conf_base_info
*/
select group_concat(b.title) as 会议议程, a.*
FROM (
        select group_concat(b.name) as 会议文件, a.*
        from (
                select group_concat(c.name) as 会议通知文件, a.*
                from (
                        select group_concat(c.name) as 会议议程文件, a.*
                        from (
                                select
                                    a.title as 会议名称, a.id as 会议id, e1.user_name as 会议主持人, GROUP_CONCAT(e.user_name) as 参会人员, d.name as 会议地点, a.start_at as 会议开始时间, a.end_at as 会议结束时间, case
                                        when a.action_status = 1 then '预发布'
                                        when a.action_status = 2 then '预备中'
                                        when a.action_status = 3 then '进行中'
                                        when a.action_status = 4 then '已结束'
                                        else '未知'
                                    end as 开会状态, IF(a.auto_msg = 1, '开启', '关闭') as 会议信息同步, IF(a.auto_status = 1, '开启', '关闭') as 会议状态更新, IF(
                                        a.start_at < NOW()
                                        and a.end_at > NOW(), IF(a.status = 1, '进行中', '禁用'), '已结束'
                                    ) as 会议状态, c.name as 会议分类, IF(a.model = 1, '议程模式', '日程模式') as 会议模式, b.nickname as 会议创建人, b.mobile as 会议创建人手机号, b.username as 会议创建人账号
                                from
                                    conference.conf_main as a
                                    #     用户
                                    left join phoenix.saas_user as b on a.creator_id = b.id
                                    #     分类
                                    left join conference.conf_category as c on a.category_id = c.id
                                    and c.status = 1
                                    #     地址
                                    left join conference.conf_place as d on a.place_id = d.id
                                    and d.status = 1
                                    #     会议人员
                                    left join conference.conf_participant as e on a.id = e.conference_id
                                    and e.status = 1
                                    left join conference.conf_participant as e1 on a.host_id = e1.id
                                    and e1.status = 1
                                where
                                    a.id = ?
                                group by
                                    a.id
                            ) as a
                            left join conference.conf_doc_arr_rel as b on a.会议id = b.conference_id
                            left join conference.conf_dir_doc_rel as c on c.id = b.conf_dir_doc_rel_id
                            and b.status = 1
                        group by
                            a.会议id
                    ) as a
                    left join conference.conf_doc_ntc_rel as b on a.会议id = b.conference_id
                    left join conference.conf_dir_doc_rel as c on c.id = b.conf_dir_doc_rel_id
                    and b.status = 1
                group by
                    a.会议id
            ) as a
            left join conference.conf_dir_doc_rel as b on a.会议id = b.conference_id
            and b.status = 1
            left join conference.conf_directory as c on b.directory_id = c.id
            and c.status = 1
        group by
            a.会议id
    ) as a
    left JOIN conf_agenda as b on b.conference_id = a.会议id
GROUP BY
    a.会议id
/**
会议文件路径查询
@query_file_path
*/
SELECT * FROM conf_dir_doc_rel WHERE conference_id = ? and name = ?