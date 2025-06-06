import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buscarChats, buscarMensagens, enviarMensagem, deletarChat, iniciarChat } from './CRUD/ChatCRUD.jsx';
import { buscarPessoaPorId } from './CRUD/PessoaCRUD.jsx';
import '../index.css';
import './CSS/Chat.css';

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [chatSelecionado, setChatSelecionado] = useState(null);
    const [loggedUser, setLoggedUser] = useState(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMensagens, setLoadingMensagens] = useState(false);
    const [error, setError] = useState('');
    const [creatingChat, setCreatingChat] = useState(false);
    const navigate = useNavigate();
    const { destinatarioIdParam } = useParams();
    const mensagensEndRef = useRef(null);
    const textAreaRef = useRef(null);

    const fetchInitialData = useCallback(async () => {
        const userId = localStorage.getItem('codPessoa');
        if (!userId) {
            alert('Sessão inválida. Faça login novamente.');
            navigate('/login');
            return;
        }
        try {
            setLoadingChats(true);
            setError('');
            const user = await buscarPessoaPorId(userId);
            if (!user) throw new Error('Usuário logado não encontrado.');
            setLoggedUser(user);
            const userChats = await buscarChats(userId);
            setChats(userChats);

            if (destinatarioIdParam) {
                const destId = parseInt(destinatarioIdParam, 10);
                if (destId === user.id) {
                    setError("Você não pode iniciar um chat consigo mesmo.");
                    return;
                }

                const chatExistente = userChats.find(c =>
                    (c.Codpessoa1 === user.id && c.Codpessoa2 === destId) ||
                    (c.Codpessoa1 === destId && c.Codpessoa2 === user.id)
                );

                if (chatExistente) {
                    handleSelecionarChat(chatExistente);
                } else {
                    setCreatingChat(true);
                    try {
                        const novoChat = await iniciarChat(user.id, destId);
                        if (novoChat && novoChat.codChat) {
                            const chatsAtualizados = await buscarChats(userId);
                            setChats(chatsAtualizados);
                            const chatRecemCriado = chatsAtualizados.find(c => c.codChat === novoChat.codChat);
                            if(chatRecemCriado) {
                                handleSelecionarChat(chatRecemCriado);
                            } else {
                                setError("Chat criado, mas não foi possível carregar.");
                            }
                        }
                    } catch (initErr) {
                        console.error('Erro ao iniciar novo chat:', initErr);
                        setError(`Não foi possível iniciar a conversa: ${initErr.message}`);
                    } finally {
                        setCreatingChat(false);
                        navigate(`/chats`, { replace: true, state: { chatCriado: true } });
                    }
                }
            }
        } catch (err) {
            console.error('Erro ao carregar dados iniciais dos chats:', err);
            setError(`Erro ao carregar chats: ${err.message}`);
        } finally {
            setLoadingChats(false);
        }
    }, [navigate, destinatarioIdParam]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens]);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [novaMensagem]);

    const fetchMensagensDoChat = useCallback(async (chatId) => {
        if (!chatId) return;
        try {
            setLoadingMensagens(true);
            setError('');
            const msgs = await buscarMensagens(chatId);
            setMensagens(msgs);
        } catch (err) {
            console.error('Erro ao buscar mensagens:', err);
            setError(`Erro ao carregar mensagens: ${err.message}`);
            setMensagens([]);
        } finally {
            setLoadingMensagens(false);
        }
    }, []);

    const handleSelecionarChat = (chat) => {
        setChatSelecionado(chat);
        setMensagens([]);
        fetchMensagensDoChat(chat.codChat);
    };

    const handleEnviarMensagem = async () => {
        if (!novaMensagem.trim() || !chatSelecionado || !loggedUser) {
            alert('Selecione um chat e digite uma mensagem.');
            return;
        }
        const codDestinatario = chatSelecionado.Codpessoa1 === loggedUser.id
                                ? chatSelecionado.Codpessoa2
                                : chatSelecionado.Codpessoa1;
        try {
            const mensagemEnviada = await enviarMensagem(loggedUser.id, codDestinatario, novaMensagem);
            
            setMensagens(prev => [...prev, { 
                ...mensagemEnviada, 
                codPessoa: loggedUser.id,
                nomePessoa: loggedUser.nome
            }]);
            setNovaMensagem('');

            const chatsAtualizados = await buscarChats(loggedUser.id);
            setChats(chatsAtualizados);

        } catch (err) {
            console.error('Erro no componente ao enviar mensagem:', err);
        }
    };

    const handleDeleteChat = async (chatId) => {
        if (!chatId) return;
        if (window.confirm('Tem certeza que deseja apagar esta conversa? A ação não pode ser desfeita.')) {
            try {
                await deletarChat(chatId);
                setChats(prev => prev.filter(chat => chat.codChat !== chatId));
                if (chatSelecionado && chatSelecionado.codChat === chatId) {
                    setChatSelecionado(null);
                    setMensagens([]);
                }
                alert('Conversa apagada com sucesso.');
            } catch (err) {
                console.error('Erro no componente ao deletar chat:', err);
            }
        }
    };

    const getNomeOutroParticipante = (chat) => {
        if (!chat || !loggedUser) return 'Desconhecido';
        return chat.Codpessoa1 === loggedUser.id ? chat.nomePessoa2 : chat.nomePessoa1;
    };

    return (
        <div className="container mt-3 chats-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-unit)' }}>
                <h2>Meus Chats</h2>
                <Link to="/menu">
                    <button className="btn btn-secondary">Voltar ao Menu</button>
                </Link>
            </header>

            {error && <p className="alert alert-danger text-center">{error}</p>}
            {creatingChat && <p className="alert alert-info text-center">Iniciando nova conversa...</p>}

            <div className="chat-layout card">
                <div className="chat-list-section">
                    <h3>Conversas</h3>
                    {loadingChats ? (
                        <p className="text-center text-muted">Carregando...</p>
                    ) : chats.length === 0 ? (
                        <p className="text-center text-muted">Nenhuma conversa iniciada.</p>
                    ) : (
                        <ul className="chat-list">
                            {chats.map((chat) => (
                                <li
                                    key={chat.codChat}
                                    onClick={() => handleSelecionarChat(chat)}
                                    className={`chat-item ${chatSelecionado?.codChat === chat.codChat ? 'active' : ''}`}
                                >
                                    <div className="chat-item-info">
                                        <h4>{getNomeOutroParticipante(chat)}</h4>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.codChat); }}
                                        className="delete-chat-button"
                                        title="Apagar conversa"
                                    >
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="chat-window-section">
                    {chatSelecionado ? (
                        <>
                            <h3>Conversa com {getNomeOutroParticipante(chatSelecionado)}</h3>
                            <div className="message-list">
                                {loadingMensagens ? (
                                    <p className="text-center text-muted">Carregando mensagens...</p>
                                ) : mensagens.length === 0 ? (
                                    <p className="text-center text-muted">Nenhuma mensagem nesta conversa ainda. Envie a primeira!</p>
                                ) : (
                                    mensagens.map((msg) => (
                                        <div
                                            key={msg.codMensagem}
                                            className={`message-item ${msg.codPessoa === loggedUser?.id ? 'sent' : 'received'}`}
                                        >
                                            <p>{msg.texto}</p>
                                        </div>
                                    ))
                                )}
                                <div ref={mensagensEndRef} />
                            </div>
                            <form className="message-input-area" onSubmit={(e) => { e.preventDefault(); handleEnviarMensagem(); }}>
                                <textarea
                                    ref={textAreaRef}
                                    value={novaMensagem}
                                    onChange={(e) => setNovaMensagem(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    rows="1"
                                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarMensagem(); } }}
                                />
                                <button type="submit" className="btn btn-primary" disabled={!novaMensagem.trim()}>Enviar</button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <p>Selecione uma conversa ao lado ou inicie uma nova a partir de um anúncio.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chats;