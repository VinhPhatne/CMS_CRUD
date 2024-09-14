import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { stateProjectOptions, kindTaskOptions } from '@constants/masterData';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useFetch from '@hooks/useFetch';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleTwoTone, Loading3QuartersOutlined } from '@ant-design/icons';
import {  Table } from 'antd';
import routes from '@routes';

const BugPage = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get('projectName');
    const projectId = queryParams.get('projectId');
    const storyName = queryParams.get('storyName');
    const storyId = queryParams.get('storyId');

    const {
        execute: fetchAutoCompleteData,
        data: autoCompleteData,
    } = useFetch(apiConfig.testPlan.summaryBug, {
        immediate: true,
        params: { projectId, storyId, storyName, active: true, projectName },
        mappingData: (response) => {
            const mappedData = response.data.content.map((item, index) => ({
                key: index.toString(),
                segmentTestPlan: item.segmentTestPlan, 
                testPlanName: item.testPlanName,
                testCaseName: item.testCaseName, 
                developerName: item.developerName,
                shortDescriptionTestHistory: item.shortDescriptionTestHistory,
                total: item.total, 
            }));
            return mappedData;
        },
    });

    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        console.log('AutoComplete Data:', autoCompleteData);
        setTableData(autoCompleteData);
    }, [autoCompleteData]);

    const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

    useEffect(() => {
        fetchAutoCompleteData();
    }, [projectId, fetchAutoCompleteData]);

    useEffect(() => {
        if (autoCompleteData) {
            setAutoCompleteOptions(autoCompleteData);
        }
    }, [autoCompleteData]);

    const testCaseCounts = (autoCompleteData || []).reduce((acc, item) => {
        acc[item.testCaseName] = (acc[item.testCaseName] || 0) + 1;
        return acc;
    }, {});

    const expandedRowRender = (record) => {
        const columns = [
            {
                dataIndex: 'icon',
                width: "190px",
                align: "center",
                key: 'icon',
                render: (text, record) => {
                    return record.shortDescriptionTestHistory ? (
                        <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                        <Loading3QuartersOutlined style={{ color: 'orange' }}/>
                    );
                },
            },
            {
                title: 'Tên Lập trình viên',
                dataIndex: 'developerName',
                key: 'developerName',
                width: "300px",
            },
            {
                title: 'Tóm tắt lỗi',
                key: 'shortDescriptionTestHistory',
                dataIndex: 'shortDescriptionTestHistory',
            },
        ];

        // Lọc tất cả các testCase có cùng tên 
        const matchedTestCases = autoCompleteData.filter((item) => item.testCaseName === record.testCaseName);

        // render từng phần tử con
        const data = matchedTestCases.map((item, index) => ({
            key: index.toString(), 
            developerName: item.developerName, 
            shortDescriptionTestHistory: item.shortDescriptionTestHistory, 
        }));
        return <Table columns={columns} dataSource={data} pagination={false} />;
    };
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            align: 'center',
            width: 40,  
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Phiên bản',
            dataIndex: 'segmentTestPlan',
            key: 'segmentTestPlan',
            align: 'center',  
            width: 110,  
        },
        {
            title: 'Test plan',
            dataIndex: 'testPlanName',
            key: 'testPlanName',
            
        },
        {
            title: 'Test case',
            dataIndex: 'testCaseName',
            key: 'testCaseName',
        },
        {
            title: 'Total',
            dataIndex: 'testCaseName',
            key: 'total',
            align: 'center',
            render: (text) => testCaseCounts[text], 
        },
    ];

    const uniqueTestCases = autoCompleteData
        ? autoCompleteData.reduce((acc, current) => {
            const isDuplicate = acc.find((item) => item.testCaseName === current.testCaseName);
            if (!isDuplicate) {
                acc.push(current); 
            }
            return acc;
        }, [])
        : [];

    return (
        <PageWrapper 
            routes={[
                { breadcrumbName: 'Project', path: routes.projectListPage.path },
                {
                    breadcrumbName: projectName,
                    path: `/project/project-tab?projectId=${projectId}&projectName=${projectName}&active=true`,
                },
                {
                    breadcrumbName: storyName,
                    path: `/project/task?projectId=${projectId}&storyId=${storyId}&storyName=${storyName}&active=true&projectName=${projectName}`,
                },
                { breadcrumbName: "Tổng hợp bug" },
            ]}>
            <ListPage
                baseTable={
                    <>
                        <Table
                            columns={columns}
                            expandable={{
                                expandedRowRender,
                                defaultExpandedRowKeys: ['0'],
                            }}
                            dataSource={uniqueTestCases}
                        />
                    </>
                }
            />
        </PageWrapper>
    );
};

export default BugPage;
