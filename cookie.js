/**
 * Created by limaoqi on 21/06/2017.
 */
(
    function () {
        let Cookie = window.Cookie = {
            getItem: (key) => {
                const pattern = '(?:(?:^|.*;\\s*)' + key + '\\s*\\=\\s*([^;]*).*$)|^.*$';
                return decodeURIComponent(document.cookie.replace(new RegExp(pattern), "$1"));
            },
            removeItem: (key) => {
                Cookie.setItem(key, '', {maxAge: -1});
            },
            setItem: (key, value, opt) => {
                opt = opt || {};
                let buf = [key, '=', encodeURIComponent(value)];
                if (opt.path) buf.push(';path=' + opt.path);
                if (opt.domain) buf.push(';domain=' + opt.domain);
                if (opt.maxAge) buf.push(';max-age=' + opt.maxAge);
                if (opt.expires) buf.push(';expires=' + opt.expires.toUTCString());
                if (opt.secure) buf.push(';secure');

                let str = buf.join('');
                document.cookie = str;
                return str;
            }
        }
    }
)();

(
    function () {
        let Cookie = window.Cookie;
        let model = window.model;
        Object.assign(model, {
            init: (callback) => {
                let data = Cookie.getItem(model.TOKEN);
                try {
                    if (data) {
                        model.data = JSON.parse(data);
                    }
                } catch (err) {
                    console.error(err);
                }
                if (callback) callback();
            },
            flush: (callback) => {
                try {
                    Cookie.setItem(model.TOKEN, JSON.stringify(model.data), {maxAge: 86400});
                } catch (err) {
                    console.error(err);
                }
                if (callback) callback();
            }
        })
    }
)();
