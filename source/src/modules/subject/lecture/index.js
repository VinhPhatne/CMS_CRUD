import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useListBase from '@hooks/useListBase';
import apiConfig from '@constants/apiConfig';
import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants/index';
import {  useLocation,  useParams } from 'react-router-dom';
import useFetch from '@hooks/useFetch';
import { HolderOutlined, MenuOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, notification, Table } from 'antd';
import routes from '../routes';
import useNotification from '@hooks/useNotification';

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

const LectureListPage = () => {
    const { id: subjectId } = useParams();
    const { pathname: pagePath } = useLocation();

    const { data: dataListTask } = useFetch(apiConfig.lecture.getBySubject, {
        pathParams: { id: subjectId },
        immediate: true,
        mappingData: (response) => response.data.content,
    });

    const notification = useNotification();

    const [items, setItems] = useState([]);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [selectedChapterId, setSelectedChapterId] = useState(null);

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

    const handleUpdatePositions = useCallback(async () => {
        try {
            const response = await updateSortLecture({ data: updatedItems });
            notification({
                type: 'success',
                message: 'Cập nhật thành công',
            });
        } catch (error) {
            notification({
                type: 'error',
                message: 'Cập nhật thất bại',
            });
        }
    }, [updatedItems, updateSortLecture, notification]);

    const [selectedChapterOrdering, setSelectedChapterOrdering] = useState(null);
    const [nextChapterOrdering, setNextChapterOrdering] = useState(null);

    const handleLectureClick = (record) => {
        const { id, lectureKind, ordering } = record;
    
        if (lectureKind === 1) {
            setSelectedChapterId(id);
            setSelectedChapterOrdering(ordering);
    
            const sortedItems = [...items]
                .filter((item) => item.lectureKind === 1)
                .sort((a, b) => a.ordering - b.ordering);
    
            const currentIndex = sortedItems.findIndex((item) => item.id === id);
            const nextItem = sortedItems[currentIndex + 1];
    
            if (nextItem) {
                setNextChapterOrdering(nextItem.ordering);
            } else {
                setNextChapterOrdering(null);
            }
        }
    };
    

    const { data, mixinFuncs, loading, pagination, queryFilter } = useListBase({
        apiConfig: apiConfig.lecture,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };

            funcs.getCreateLink = () => {
                return `${pagePath}/create?nextOrdering=${nextChapterOrdering}`;
            };
        },
    });

    const columns = [
        {
            key: 'sort',
            align: 'center',
            width: 0,
            render: () => <DragHandle />,
        },
        {
            title: <FormattedMessage defaultMessage="Tên bài giảng" />,
            dataIndex: 'lectureName',
            width: '50%',
            render: (lectureName, record) => {
                const { id, lectureKind } = record;
                const isSelectedChapter = selectedChapterId === id && lectureKind === 1;

                return (
                    <div
                        onClick={() => handleLectureClick(record)}
                        style={{
                            display: 'flex',
                            cursor: lectureKind === 1 ? 'pointer' : 'default',
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
            { width: '130px', align: 'right', fixed: "right" },
        ),
    ];

    const getRowStyle = (record) => ({
        backgroundColor: record.id === selectedChapterId ? '#d3d3d3' : 'transparent',
        cursor: 'pointer',
    });

    const sortedItems = items.sort((a, b) => a.ordering - b.ordering);

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: <FormattedMessage defaultMessage="Subject" />, path: routes.SubjectListPage.path },
                { breadcrumbName: <FormattedMessage defaultMessage="Lecture" /> },
            ]}
        >
            <ListPage
                style={{ width: '780px' }}
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
                                    pagination={false}
                                    onRow={(record) => ({
                                        style: getRowStyle(record),
                                    })}
                                    scroll={{ x: 'max-content' }}
                                />
                            </SortableContext>
                        </DndContext>
                        <Button
                            onClick={handleUpdatePositions}
                            type="primary"
                            style={{ marginLeft: '600px',marginTop:"20px", width: '140px' }}
                        >
                            Cập nhật vị trí
                        </Button>
                    </>
                }
            />
        </PageWrapper>
    );
};
export default LectureListPage;
