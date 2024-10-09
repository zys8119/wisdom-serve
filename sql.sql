/*
@aaa
*/
SELECT *
FROM conference.conf_dir_doc_rel
    LEFT JOIN conference.conf_dir_doc_rel_rel ON 1 = 1
GROUP BY
    `conference.conf_dir_doc_rel`.id
    /*
    @aaa
    */
SELECT 1