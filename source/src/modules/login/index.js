import { Button, ConfigProvider, Form } from 'antd';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import InputTextField from '@components/common/form/InputTextField';
import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import { setCacheAccessToken } from '@services/userService';

const message = defineMessages({
    username: 'Username',
    password: 'Password',
    login: 'Login',
    copyRight: '{brandName} - © Copyright {year}. All Rights Reserved',
    loginFail: 'Sai tên đăng nhập hoặc mật khẩu !!!',
    notFound: 'Không tìm thấy tài khoản này trong app',
    verifyFailOTP: 'Mã OTP không đúng!!!',
    systemError: 'Lỗi hệ thống!',
    fail: 'Có lỗi xảy ra khi đăng nhập',
    verifySuccessOTP: 'Xác thực OTP thành công!!!',
    loginNoAccess: 'Loại tài khoản không phù hợp!!!',
    otp: 'OTP',
    cancel: 'Hủy',
});

import {
    apiTenantId,
    brandName,
    envType,
    storageKeys,
} from '@constants';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { showErrorMessage } from '@services/notifyService';
import { accountActions } from '@store/actions';
import { setData } from '@utils/localStorage';
import Title from 'antd/es/typography/Title';
import { Buffer } from 'buffer';
import { appType } from '../../constants';
import styles from './index.module.scss';
window.Buffer = window.Buffer || Buffer;

const LoginPage = () => {
    const [isMfaSSO, setIsMfaSSO] = useState(null);
    const [urlSSO, setUrlSSO] = useState(null);
    const [inforUser, setInforUser] = useState({});
    const [otpValue, setOtpValue] = useState('');
    const [form] = Form.useForm();
    const [formOTP] = Form.useForm();
    const intl = useIntl();
    const translate = useTranslate();
    const { execute, loading } = useFetch({
        ...apiConfig.account.loginBasic,
    });
    const tenantIdUrl = envType !== 'dev' && window.location.href.split('.')[0].split('//')[1].split('-')[0];
    const tenantId = envType === 'dev' ? apiTenantId : tenantIdUrl;

    const { execute: executeSSO, loading: loadingSSO } = useFetch({
        ...apiConfig.account.loginSSO,
    });
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile, {
        loading: useFetchAction.LOADING_TYPE.APP,
    });
    const notification = useNotification();
    const onFinish = (values) => {
        executeSSO({
            data: { ...values, app: appType },
            onCompleted: (res) => {
                if (res.data.isMfaEnable == false) {
                    execute({
                        data: { ...values, app: appType },
                        onCompleted: (res) => {
                            console.log(res);
                            handleLoginSuccess(res);
                        },
                        // onError: (err) => {
                        //     if (err?.response?.data?.message == 'Not found accountApp') {
                        //         showErrorMessage(translate.formatMessage(message.notFound));
                        //     } else {
                        //         showErrorMessage(translate.formatMessage(message.loginFail));
                        //     }
                        // },
                    });
                } else {
                    setIsMfaSSO(res.data.isMfa);
                    if (res.data.qrUrl) {
                        setUrlSSO(res.data.qrUrl);
                    }
                    setInforUser(values);
                }
            },
            onError: () => showErrorMessage('123'),
        });
    };

    const onFinishOTP = (values) => {
        execute({
            data: { ...values, ...inforUser, app: appType },
            onCompleted: (res) => {
                handleLoginSuccess(res);
            },
            onError: (err) => {
                if (err?.response.data.status == 500) {
                    showErrorMessage(translate.formatMessage(message.systemError));
                } else if (err?.response.data.errorCode == 'ERROR-ACCOUNT-0014') {
                    showErrorMessage(translate.formatMessage(message.verifyFailOTP));
                } else {
                    showErrorMessage(translate.formatMessage(message.fail));
                }
            },
        });
    };

    const handleLoginSuccess = (res) => {
        setCacheAccessToken(res?.access_token);
        setData(storageKeys.USER_KIND, res?.user_kind);
        //setData(storageKeys?.USER_PROJECT_ACCESS_TOKEN, res.access_token);
        executeGetProfile({ kind: res?.user_kind });
    };

    const checkUserName = (_, value) => {
        if (value) {
            const usernameRegex = /^[a-zA-Z0-9_]{2,20}$/;
            if (!usernameRegex.test(value)) {
                return Promise.reject('Tài khoản không hợp lệ !');
            }
        } else return Promise.reject('Vui lòng nhập tài khoản !');

        return Promise.resolve();
    };
    const checkPassword = (_, value) => {
        if (value) {
            const passwordRegex = /^[A-Za-z\d!@#$%^&*()_+\-=]{6,}$/;
            if (!passwordRegex.test(value)) {
                return Promise.reject('Mật khẩu không hợp lệ !');
            }
        } else return Promise.reject('Vui lòng nhập mật khẩu !');

        return Promise.resolve();
    };

    return (
        <div className={styles.loginPage}>
            {isMfaSSO == null ? (
                <div className={styles.loginForm}>
                    <Title level={3}>{intl.formatMessage(commonMessage.login).toUpperCase()}</Title>
                    <Form form={form} name="login-form" onFinish={onFinish} layout="vertical">
                        <InputTextField
                            name="username"
                            fieldProps={{ prefix: <UserOutlined /> }}
                            label={intl.formatMessage(message.username)}
                            placeholder={intl.formatMessage(commonMessage.username)}
                            size="large"
                            rules={[
                                {
                                    required: true,
                                    validator: checkUserName,
                                },
                            ]}
                        />
                        <InputTextField
                            name="password"
                            fieldProps={{ prefix: <LockOutlined /> }}
                            label={intl.formatMessage(message.password)}
                            placeholder={intl.formatMessage(commonMessage.password)}
                            size="large"
                            type="password"
                            rules={[
                                {
                                    required: true,
                                    validator: checkPassword,
                                },
                            ]}
                        />

                        <Button
                            type="primary"
                            size="large"
                            loading={loading}
                            htmlType="submit"
                            style={{ width: '100%' }}
                        >
                            {intl.formatMessage(commonMessage.login)}
                        </Button>
                        <center className="s-mt4px">
                            <small>
                                {intl.formatMessage(message.copyRight, { brandName, year: new Date().getFullYear() })}
                            </small>
                        </center>
                    </Form>
                </div>
            ) : (
                <div style={{ width: 'max-content', minWidth: 500 }}>
                    <Title level={2}>{intl.formatMessage(commonMessage.authentication).toUpperCase()}</Title>
                    {urlSSO != null && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4} style={{ margin: '0 0 8px 0' }}>
                                    Quét Mã vạch QR
                                </Title>
                                <span style={{ opacity: '0.6', fontSize: 14, fontFamily: 'BlinkMacSystemFont' }}>
                                    Thiết lập tài khoản mới trong ứng dụng xác thực của bạn và quét mã vạch QR sau
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <img src={urlSSO} style={{ width: 240, height: 240 }} />
                            </div>
                        </div>
                    )}
                    <Form
                        form={formOTP}
                        name="otp-form"
                        onFinish={onFinishOTP}
                        layout="vertical"
                        onValuesChange={(changedValues) => setOtpValue(changedValues.totp)}
                    >
                        <InputTextField
                            name="totp"
                            fieldProps={{ prefix: <LockOutlined /> }}
                            placeholder={intl.formatMessage(commonMessage.otp)}
                            size="large"
                            required
                            type={'number'}
                            rules={[
                                {
                                    required: true,
                                    validator: checkUserName,
                                },
                            ]}
                        />
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                marginTop: '16px',
                            }}
                        >
                            <Button
                                type="primary"
                                size="large"
                                loading={loading}
                                htmlType="submit"
                                //style={{ width: '25%' }}
                                disabled={!otpValue}
                            >
                                {intl.formatMessage(commonMessage.confirm)}
                            </Button>
                            <ConfigProvider
                                button={{
                                    className: styles.button,
                                }}
                            >
                                <Button
                                    size="large"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMfaSSO(null);
                                        setUrlSSO(null);
                                        formOTP.resetFields();
                                        setOtpValue('');
                                    }}
                                    style={{ width: 'max-content' }}
                                >
                                    {intl.formatMessage(message.cancel)}
                                </Button>
                            </ConfigProvider>
                        </div>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
