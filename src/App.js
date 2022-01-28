import React, {useEffect, useState} from "react";
import {
    Avatar,
    Box,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TextField
} from "@mui/material";
import {makeStyles} from '@mui/styles';
import _ from "lodash";
import axios from "axios";
import {FlagCircle} from "@mui/icons-material";

const BASE_URL = 'https://www.cbr-xml-daily.ru/daily_json.js'
// const BASE_URL = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/'
const useStyles = makeStyles({
    paper: {
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        "&>*": {
            margin: "auto"
        }
    },
    mAuto: {
        // margin: "auto"
    }
});

function App() {
    const classes = useStyles()
    const [data, setData] = useState([]);
    const [toCurrency, setToCurrency] = useState();
    const [defaultCurrency, setDefaultCurrency] = useState(false);
    const [convertedValue, setConvertedValue] = useState(0);
    const [value, setValue] = React.useState('');

    const getData = () => axios.get(BASE_URL)
        .then((res) => setData(
            [..._.values(_.get(res, 'data.Valute')),
                {
                    "ID": "1",
                    "NumCode": "1",
                    "CharCode": "RUB",
                    "Nominal": 1,
                    "Name": "Российский рубль",
                    "Value": 1,
                    "Previous": 1
                }
            ]
            )
        ).catch((error) => console.log(error))
    const convert = (from, to = {}, amount) => _.round(
        _.multiply(
            _.divide(
                _.divide(from.Value, from.Nominal),
                _.divide(to.Value, to.Nominal)
            )
            , amount
        )
        , 3)

    useEffect(() => {
        if (!defaultCurrency) setDefaultCurrency(_.last(data))
        else setDefaultCurrency(_.find(data, {ID: defaultCurrency.ID}))
    }, [data])
    useEffect(() => {
        const splittedValue = _.split(value, ' ');
        if (splittedValue.length === 4) {
            const from = _.find(data, {CharCode: splittedValue[1].toUpperCase()});
            const to = _.find(data, {CharCode: splittedValue[3].toUpperCase()});
            if (from && to) {
                setToCurrency(to)
                setConvertedValue(convert(from, to, splittedValue[0]))
            }else setConvertedValue(0)
        }else setConvertedValue(0)
    }, [value]);
    useEffect(() => getData(), []);// get initial data
    useEffect(() => { // get data by interval
        const intervalId = setInterval(() => getData(), 15000)
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                backgroundColor: '#f6f6f6',
                '& > :not(style)': {
                    m: '2%',
                    width: '41%',
                    height: '80%',
                },
            }}
        >
            <Paper
                className={classes.paper}
                elevation={3}
            >
                <h2>Конвертер из одной валюты в другую. На этой странице должно быть текстовое поле, в которое можно
                    ввести текст в виде 15 usd in rub и получить результат.</h2>
                <TextField
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    label="Text"
                    variant="outlined"
                />
                <h1>
                    {convertedValue ? `${convertedValue} - ${toCurrency && toCurrency.Name}` : ''}
                </h1>
            </Paper>
            <Paper className={classes.paper} elevation={3}>
                <h2 style={{marginBottom: "1rem"}}> Страница с текущими курсами валют. На этой странице пользователь
                    должен видеть «свежие» курсы валют относительно базовой валюты — например, если базовая валюта —
                    рубль, то пользователь видит, что 1 USD = 63.49 RUB, а 1 EUR = 72.20 и т.д.
                    По-умолчанию у пользователя должна определяться «базовая» валюта, которую он может настроить.
                    Страница должна обновляться каждые 15 секунд.</h2>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Default currency</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={defaultCurrency}
                        defaultValue={defaultCurrency}
                        label="Default currency"
                        onChange={e => setDefaultCurrency(e.target.value)}
                    >
                        {data.map((v, i) => <MenuItem key={i} value={v}>{v.Name}</MenuItem>)}
                    </Select>
                </FormControl>
                <List sx={{width: '100%', overflow: "auto"}}>
                    {data.map((v, i) => <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <FlagCircle/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={v.Name} secondary={`${convert(v, defaultCurrency, 1)} - ${defaultCurrency.Name}`}/>
                    </ListItem>)}
                </List>
            </Paper>
        </Box>
    );
}

export default App;
