import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { buscarAnuncios, editarAnuncio } from './CRUD/AnuncioCRUD'; // Precisa buscar anúncio específico
import './CSS/CriarAnuncio.css'; // Reutilizar ou criar CSS específico

const API_URL = 'http://localhost:3001';

// Função auxiliar para buscar um único anúncio (pode ser movida para AnuncioCRUD se usada em mais lugares)
const buscarAnuncioPorId = async (id) => {
    try {
        // Reutiliza a busca geral e filtra, ou cria endpoint específico no backend
        const todosAnuncios = await buscarAnuncios(); // Busca todos
        const anuncio = todosAnuncios.find(a => a.CodAnuncio === parseInt(id, 10));
        if (!anuncio) {
            throw new Error('Anúncio não encontrado.');
        }
        // Adiciona lógica para buscar detalhes de Modelo/Versão se necessário
        // A busca geral já traz nomeModelo, nomeVersao, ano
        return anuncio;
    } catch (error) {
        console.error("Erro ao buscar anúncio por ID:", error);
        throw error;
    }
};

const EditarAnuncio = () => {
    const { idAnuncio } = useParams();
    const navigate = useNavigate();
    const [anuncio, setAnuncio] = useState(null);
    const [form, setForm] = useState({
        valor: '',
        descricao: '',
        fotos: '', // String separada por vírgula/nova linha
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [codPessoaAnuncio, setCodPessoaAnuncio] = useState(null);

    useEffect(() => {
        const codPessoaLogado = localStorage.getItem('codPessoa');
        if (!codPessoaLogado) {
            alert('Você precisa estar logado para editar anúncios.');
            navigate('/login');
            return;
        }

        const fetchAnuncio = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await buscarAnuncioPorId(idAnuncio);
                
                // Verificar se o usuário logado é o dono do anúncio
                if (data.CodPessoa !== parseInt(codPessoaLogado, 10)) {
                    alert('Você não tem permissão para editar este anúncio.');
                    navigate('/menu');
                    return;
                }
                
                setAnuncio(data);
                setCodPessoaAnuncio(data.CodPessoa); // Guarda o dono original
                setForm({
                    valor: data.valor || '',
                    descricao: data.descricao || '',
                    // Transforma o array de fotos do backend em string para o textarea
                    fotos: data.fotos ? data.fotos.map(f => f.linkFoto).join('\n') : '', 
                });
            } catch (err) {
                console.error(err);
                setError(`Erro ao carregar anúncio: ${err.message}`);
                // Opcional: redirecionar se anúncio não encontrado
                // navigate('/menu'); 
            } finally {
                setLoading(false);
            }
        };

        fetchAnuncio();
    }, [idAnuncio, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const { valor, descricao, fotos } = form;
        const fotosArray = fotos.split(/\s*[\n,]+\s*/).filter(link => link.trim() !== '');

        if (!valor && !descricao && fotosArray.length === 0) {
            setError('Nenhum campo foi modificado ou preenchido para atualização.');
            return;
        }
        
        // Monta o objeto apenas com os campos que podem ser atualizados
        const dadosUpdate = {
            valor: parseFloat(valor),
            descricao,
            fotos: fotosArray,
        };

        try {
            await editarAnuncio(idAnuncio, dadosUpdate);
            alert('Anúncio atualizado com sucesso!');
            navigate('/menu'); // Volta para o menu após editar
        } catch (err) {
            console.error('Falha ao submeter formulário de edição:', err);
            setError(`Erro ao atualizar anúncio: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="loading">Carregando dados do anúncio...</div>;
    }

    if (error) {
        return <div className="error-message">{error} <Link to="/menu">Voltar ao Menu</Link></div>;
    }

    if (!anuncio) {
         return <div className="error-message">Anúncio não encontrado. <Link to="/menu">Voltar ao Menu</Link></div>;
    }

    return (
        <div className="criar-anuncio-container"> {/* Reutilizando a classe */} 
            <h2>Editar Anúncio</h2>
            {/* Exibe informações não editáveis */} 
            <div className="anuncio-info-nao-editavel">
                <p><strong>Modelo:</strong> {anuncio.nomeModelo}</p>
                <p><strong>Versão:</strong> {anuncio.nomeVersao} ({anuncio.ano})</p>
            </div>

            <form onSubmit={handleSubmit} className="anuncio-form">
                {/* Valor */} 
                <div className="input-group">
                    <label htmlFor="valor">Valor (R$):</label>
                    <input
                        id="valor"
                        type="number"
                        name="valor"
                        placeholder="Ex: 50000.00"
                        value={form.valor}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="input-field"
                    />
                </div>

                {/* Descrição */} 
                <div className="input-group">
                    <label htmlFor="descricao">Descrição:</label>
                    <textarea
                        id="descricao"
                        name="descricao"
                        placeholder="Descreva o veículo, estado de conservação, etc."
                        value={form.descricao}
                        onChange={handleInputChange}
                        className="input-field"
                        rows="4"
                    />
                </div>

                {/* Fotos */} 
                <div className="input-group">
                    <label htmlFor="fotos">Links das Fotos:</label>
                    <textarea
                        id="fotos"
                        name="fotos"
                        placeholder="Cole os links das fotos aqui, um por linha ou separados por vírgula"
                        value={form.fotos}
                        onChange={handleInputChange}
                        className="input-field"
                        rows="5"
                    />
                    <small>Insira um link por linha ou separe-os por vírgula. As fotos anteriores serão substituídas.</small>
                </div>

                <button type="submit" className="submit-button">Salvar Alterações</button>
                <Link to="/menu" className="cancel-link-button">Cancelar</Link> 
            </form>
        </div>
    );
};

export default EditarAnuncio;

