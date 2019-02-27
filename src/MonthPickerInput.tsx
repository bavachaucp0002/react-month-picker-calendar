import React, { Component } from 'react';
import InputMask from 'react-input-mask';
import moment from 'moment';
// import { extendMoment } from 'moment-range';

const DATE_FORMAT = {
    default: 'YYYY/MM',
    ja: 'YYYY/MM'
};

import MonthCalendar from './calendar';
import { valuesToMask, valuesFromMask } from './utils';

import { II18n, DEFAULT_I18N as I18n_DEF } from './i18n';
import Translator from './Translator';

import './styles/index.css';

type OnChange = (maskedValue: string, year: number, month: number) => any;

export const DEFAULT_I18N = I18n_DEF;

export interface IProps {
    year?: number;
    month?: number;
    lang?: string;
    inputProps?: {
        name?: string;
        id?: string;
    };
    onChange?: OnChange;
    closeOnSelect?: boolean;
    onChangeYearUpdate?: boolean;
    inputRef?: Function;
    rangePicker?: boolean;
    isOpen?: boolean;
    monthYearFormat?: string;
    placeholder?: any;
    i18n?: Partial<II18n>;
    disabledInputChange?: boolean;
    className?: string;
}

export interface IState {
    year: void | number;
    month: void | number;
    inputValue: string;
    showCalendar: boolean;
}

class MonthPickerInput extends Component<IProps, IState> {
    wrapper: HTMLDivElement;
    input: { input: Element };
    private t: Translator;
    private inputMask: string;

    public static defaultProps: Partial<IProps> = {
        inputProps: {},
        closeOnSelect: false,
        rangePicker: false,
        disabledInputChange: false
    };

    _monthYearHandler = false;

    constructor(props) {
        super(props);

        this.handleStateInitialize();
    }

    componentDidUpdate(prevProps) {
        this.onCalendarMount(prevProps);
    }

    componentWillReceiveProps(nextProps: IProps): void {
        const update: Partial<IState> = {};

        if (nextProps.year !== this.props.year) {
            update.year = nextProps.year;
        }
        if (nextProps.month !== this.props.month) {
            update.month = nextProps.month;
        }

        if (Object.keys(update).length) {
            const month = update.month || this.state.month;
            const year = update.year || this.state.year;
            update.inputValue = this.valuesToMask(month, year);
            this.setState(update as IState);
        }
    }

    valuesToMask = (month: number | void, year: number | void): string => {
        if (typeof year == 'number' && typeof month == 'number') {
            return valuesToMask(month, year, this.t);
        } else return '';
    };

    onCalendarMount = (prevProps): void => {
        const { year, month } = this.props;

        if (prevProps.month !== month && prevProps.year !== year && !this._monthYearHandler) {
            this.handleStateInitialize();
            this.setState({
                year: year || new Date().getFullYear(),
                month: month || new Date().getMonth()
            });
            this._monthYearHandler = true;
        }
    };

    handleStateInitialize = (): void => {
        const { year, month } = this.props;
        let inputValue = '';

        // if (typeof year == 'number' && typeof month == 'number') {
        //   inputValue = valuesToMask(month, year, this.props.lang);
        // }

        this.t = new Translator(this.props.lang, this.props.i18n);
        this.inputMask = this.t.dateFormat().replace(/M|Y/g, '9');

        this.state = {
            year,
            month,
            inputValue,
            showCalendar: false
        };
    };

    onCalendarChange = (year: number, month: number): void => {
        const inputValue = this.valuesToMask(month, year);
        this.setState({
            inputValue,
            year,
            month,
            showCalendar: !this.props.closeOnSelect
        });
        this.onChange(inputValue, year, month);
    };

    onInputChange = (e: { target: { value: string } }): void => {
        const mask = e.target.value;

        if (mask.length && mask.indexOf('_') === -1) {
            const [month, year] = valuesFromMask(mask);
            const inputValue = this.valuesToMask(month, year);
            this.setState({ year, month, inputValue });
            this.onChange(inputValue, year, month);
        } else this.setState({ inputValue: mask });
    };

    onChange = (inputValue, year, month) => {
        if (this.props.onChange) {
            this.props.onChange(inputValue, year, month);
        }
        // this.handleDateRange(year, month)
    };

    onInputBlur = (e): void => {
        if (!this.wrapper.contains(e.target)) {
            this.setState({ showCalendar: false });
        }
    };

    onInputFocus = (e): void => {
        if (this.wrapper.contains(e.target)) {
            this.setState({ showCalendar: true });
        }
    };

    onCalendarOutsideClick = (e): void => {
        this.setState({ showCalendar: this.input.input == e.target });
    };

    calendar = (): JSX.Element => {
        const { onChangeYearUpdate, rangePicker, className } = this.props;
        const { year, month } = this.state;
        let lang = this.props.lang ? this.props.lang : 'default';
        return (
            <div style={{ position: 'relative' }} className={className}>
                <MonthCalendar
                    year={year}
                    month={month}
                    lang={lang}
                    onChange={this.onCalendarChange}
                    onOutsideClick={this.onCalendarOutsideClick}
                    onChangeYearUpdate={onChangeYearUpdate}
                    rangePicker={rangePicker}
                />
            </div>
        );
    };

    inputProps = ({ customPlaceholder }): object => {
        const { inputRef, disabledInputChange } = this.props;

        // monthYearFormat: TODO
        let dateFormat = DATE_FORMAT['default'];
        if (this.props.lang == 'ja') {
            dateFormat = DATE_FORMAT['ja'];
        }
        return Object.assign(
            {},
            {
                ref: input => {
                    if (input) this.input = input;

                    inputRef && inputRef(input);
                },
                mask: this.inputMask,
                placeholder: customPlaceholder ? customPlaceholder : this.t.dateFormat(),
                type: 'text',
                onBlur: this.onInputBlur,
                onFocus: this.onInputFocus,
                onChange: !disabledInputChange ? this.onInputChange : null
            },
            this.props.inputProps
        );
    };

    handleRenderCalendar = () => {
        if (this.props.isOpen || this.state.showCalendar) {
            return this.calendar();
        }

        return false;
    };

    render() {
        const { placeholder } = this.props;
        return (
            <div
                ref={wrap => {
                    if (wrap) this.wrapper = wrap;
                }}
            >
                <InputMask
                    value={this.state.inputValue}
                    {...this.inputProps({
                        customPlaceholder: placeholder
                    })}
                />
                {this.handleRenderCalendar()}
            </div>
        );
    }
}

export { DateFormat, MonthFormat } from './i18n';

export default MonthPickerInput;
