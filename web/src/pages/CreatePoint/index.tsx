import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import Backdrop from '@material-ui/core/Backdrop';
import { makeStyles } from '@material-ui/core/styles';

import Dropzone from '../components/Dropzone/index';

import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';
import { join } from 'path';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface UF {
    sigla: string;
    nome: string;
}

interface IBGECityResponse {
    nome: string;
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column'
    },
}));

const CreatePoint = () => {
    const [ items, setItems ] = useState<Item[]>([]);
    const [ ufs, setUFs ] = useState<UF[]>([]);
    const [ citys, setCitys ] = useState<string[]>([]);

    const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0, 0]);

    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [ selectedUf, setSelectedUf ] = useState('');
    const [ selectedCity, setSelectedCity ] = useState('');
    const [ selectedItems, setSelectedItems ] = useState<number[]>([]);
    const [ selectedPosition, setSelectedPosition ] = useState<[number, number]>([0, 0]);
    const [ selectedFile, setSelectedFile ] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([
                latitude,
                longitude
            ]);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    useEffect(() => {
        axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
            const ufs = response.data.map((uf: UF) => {
                return { 
                    sigla: uf.sigla,
                    nome: uf.nome
                };
            });

            setUFs(ufs);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '') return;

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/microrregioes?orderBy=nome`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);

                setCitys(cityNames);
            });
    }, [ selectedUf ]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        })
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);
        let items = [ ...selectedItems, id ];

        if (alreadySelected >= 0) {
            items = items.filter(item => item !== id);
        }

        setSelectedItems([ ...items ]);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [ latitude, longitude ] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('points', data);

        handleSuccessOpen();
        setTimeout(() => history.push('/'), 2000);
    }

    const classes = useStyles();
    const [ open, setOpen ] = useState(false);

    function handleSuccessOpen() {
        setOpen(true);
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={ logo } alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={ handleSubmit }>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={ handleInputChange }
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={ handleInputChange }
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={ handleInputChange }
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Seleciona o endereço no mapa</span>
                    </legend>

                    <Map center={ initialPosition } zoom={15} onClick={ handleMapClick }>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={ selectedPosition } />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={ selectedUf } onChange={ handleSelectedUf } >
                                <option value="">Selecione uma UF</option>
                                { ufs.map(uf => (
                                    <option key={ uf.sigla } value={ uf.sigla }>{ uf.nome }</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={ selectedCity } onChange={ handleSelectedCity } >
                                <option value="0">Selecione uma cidade</option>
                                { citys.map(city => (
                                    <option key={ city } value={ city }>{ city }</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens a baixo</span>
                    </legend>

                    <ul className="items-grid">
                        { items.map(item => (
                            <li
                                key={item.id}
                                onClick={ () => handleSelectItem(item.id) }
                                className={ selectedItems.includes(item.id) ? 'selected' : '' }
                            >
                                <img src={ item.image_url } alt={ item.title } />
                                <span>{ item.title }</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
            <Backdrop className={ classes.backdrop } open={ open }>
                <span>
                    <FiCheckCircle size="64"  className="check-circle" />
                </span>
                <span className="success-message">Cadastro concluido!</span>
            </Backdrop>
        </div>
    );
}

export default CreatePoint;