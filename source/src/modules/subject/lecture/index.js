import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import BaseTable from '@components/common/table/BaseTable';
import useListBase from '@hooks/useListBase';
import apiConfig from '@constants/apiConfig';
import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants/index';
import { convertUtcToLocalTime } from '@utils/index';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { statusOptions } from '@constants/masterData';
//import { commonMessage } from '@locales/intl';
import { BaseForm } from '@components/common/form/BaseForm';
import useFetch from '@hooks/useFetch';
import { HolderOutlined, MenuOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table } from 'antd';
import routes from '../routes';
const RowContext = React.createContext({});
const DragHandle = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
        <Button
            type="text"
            size="small"
            icon={<MenuOutlined />}
            style={{
                cursor: 'move',
            }}
            ref={setActivatorNodeRef}
            {...listeners}
        />
    );
};

const Row = (props) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });
    const style = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };
    const contextValue = useMemo(
        () => ({
            setActivatorNodeRef,
            listeners,
        }),
        [setActivatorNodeRef, listeners],
    );
    return (
        <RowContext.Provider value={contextValue}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes} />
        </RowContext.Provider>
    );
};

const message = defineMessages({
    objectName: {
        defaultMessage: 'Bài giảng',
    },
});
const LectureListPage = () => {
    const { id: subjectId } = useParams();

    console.log('subjectId', subjectId);

    const { data: dataListTask } = useFetch(apiConfig.lecture.getBySubject, {
        pathParams: { id: subjectId },
        immediate: true,
        mappingData: (response) => response.data.content,
    });
    const translate = useTranslate();
    const navigate = useNavigate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    console.log('dataListTask', dataListTask);

    const [items, setItems] = useState([]);
    const [updatedItems, setUpdatedItems] = useState([]);

    const { execute: updateSortLecture } = useFetch(apiConfig.lecture.updateSort, {
        immediate: false,
    });

    useEffect(() => {
        if (dataListTask) {
            const sortedItems = [...dataListTask].sort((a, b) => a.ordering - b.ordering);
            setItems(sortedItems);
        }
    }, [dataListTask]);

    const handleDragEnd = useCallback(({ active, over }) => {
        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const updatedItems = arrayMove(items, oldIndex, newIndex);
                const reorderedItems = updatedItems.map((item, index) => ({
                    ...item,
                    ordering: index,
                }));
                setUpdatedItems(reorderedItems);
                return reorderedItems;
            });
        }
    }, []);

    const handleUpdatePositions = useCallback(() => {
        updateSortLecture({ data: updatedItems });
    }, [updatedItems, updateSortLecture]);

    console.log('items', items);

    const { data, mixinFuncs, loading, pagination, queryFilter } = useListBase({
        // apiConfig: {
        //     ...apiConfig.lecture,
        //     getList: apiConfig.lecture.getBySubject,
        // },
        apiConfig: apiConfig.lecture,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            //objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            // funcs.prepareGetListPathParams = (params) => {
            //     return {
            //         subjectId: subjectId,
            //     };
            // };

            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
        },
    });

    const columns = [
        {
            key: 'sort',
            align: 'center',
            width: 10,
            render: () => <DragHandle />,
        },
        {
            title: <FormattedMessage defaultMessage="Tên bài giảng" />,
            dataIndex: 'lectureName',
            width: '50%',
            render: (lectureName, record) => {
                const { id, lectureKind } = record;
                //const isChecked = lectureIds.includes(id);
                //const isSelected = selectedLecture === id;
                //const showRadio = lectureKind !== 1;

                return (
                    <div
                        style={{
                            display: 'flex',

                            width: '100%',
                        }}
                    >
                        <span
                            style={{
                                fontWeight: lectureKind === 1 ? 'bold' : 'normal',
                                textTransform: lectureKind === 1 ? 'uppercase' : 'none',
                                marginLeft: lectureKind === 2 ? '30px' : '0',
                                flex: 1,
                            }}
                        >
                            {lectureName}
                        </span>
                    </div>
                );
            },
        },
        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '180px' },
        ),
    ];

    //console.log('Items:', items);
    const sortedItems = items.sort((a, b) => a.ordering - b.ordering);
    return (
        <PageWrapper
            routes={[
                { breadcrumbName: <FormattedMessage defaultMessage="Subject" />, path: routes.SubjectListPage.path },
                { breadcrumbName: <FormattedMessage defaultMessage="Bài giảng" /> },
            ]}
        >
            <ListPage
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <>
                        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={items.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <Table
                                    rowKey="id"
                                    components={{ body: { row: Row } }}
                                    columns={[...columns]}
                                    dataSource={sortedItems}
                                    loading={loading}
                                />
                            </SortableContext>
                        </DndContext>
                        <Button
                            onClick={handleUpdatePositions}
                            type="primary"
                            style={{ marginLeft: '850px', width: '140px' }}
                        >
                            Cập nhật vị trí
                        </Button>{' '}
                    </>
                }
            />
        </PageWrapper>
    );
};
export default LectureListPage;
