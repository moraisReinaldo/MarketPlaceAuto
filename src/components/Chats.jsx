import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buscarChats, buscarMensagens, enviarMensagem, deletarChat, iniciarChat } from './CRUD/ChatCRUD.jsx'; // Adicionar iniciarChat
import { buscarPessoaPorId } from './CRUD/PessoaCRUD.jsx';
import '../index.css'; // Estilos globais
import './CSS/Chat.css'; // Estilos específicos modernizados

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [chatSelecionado, setChatSelecionado] = useState(null);
    const [loggedUser, setLoggedUser] = useState(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMensagens, setLoadingMensagens] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { destinatarioIdParam } = useParams(); // Captura ID do destinatário da URL
    const mensagensEndRef = useRef(null);
    const textAreaRef = useRef(null); // Ref para o textarea

    // Função para buscar dados iniciais (usuário logado e chats)
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

            // Se veio de um link com destinatário, tenta selecionar ou iniciar o chat
            if (destinatarioIdParam) {
                const destId = parseInt(destinatarioIdParam, 10);
                if (destId === user.id) {
                    console.warn("Tentativa de iniciar chat consigo mesmo.");
                    // Poderia redirecionar ou mostrar mensagem
                    return;
                }

                const chatExistente = userChats.find(c =>
                    (c.Codpessoa1 === user.id && c.Codpessoa2 === destId) ||
                    (c.Codpessoa1 === destId && c.Codpessoa2 === user.id)
                );

                if (chatExistente) {
                    handleSelecionarChat(chatExistente);
                } else {
                    // Tenta iniciar um novo chat
                    console.log(`Iniciando novo chat com usuário ${destId}`);
                    try {
                        const novoChat = await iniciarChat(user.id, destId);
                        if (novoChat && novoChat.codChat) {
                            // Adiciona o novo chat à lista local e seleciona
                            const chatsAtualizados = await buscarChats(userId); // Rebusca para ter nomes corretos
                            setChats(chatsAtualizados);
                            const chatRecemCriado = chatsAtualizados.find(c => c.codChat === novoChat.codChat);
                            if(chatRecemCriado) {
                                handleSelecionarChat(chatRecemCriado);
                            } else {
                                 console.error("Não foi possível encontrar o chat recém-criado na lista atualizada.");
                                 setError("Erro ao selecionar o chat recém-criado.");
                            }
                        } else {
                            throw new Error("Falha ao criar o chat no backend.");
                        }
                    } catch (initErr) {
                        console.error('Erro ao iniciar novo chat:', initErr);
                        setError(`Não foi possível iniciar a conversa: ${initErr.message}`);
                    }
                }
            }

        } catch (err) {
            console.error('Erro ao carregar dados iniciais dos chats:', err);
            setError(`Erro ao carregar chats: ${err.message}`);
        } finally {
            setLoadingChats(false);
        }
    }, [navigate, destinatarioIdParam]); // Adicionar dependências

    // Busca dados iniciais no mount
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]); // Usar useCallback para evitar loop

    // Scroll para o fim das mensagens
    useEffect(() => {
        mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens]);

    // Ajustar altura do textarea dinamicamente
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto'; // Reseta altura
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Ajusta para conteúdo
        }
    }, [novaMensagem]);

    // Função para buscar mensagens de um chat
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

    // Handler para selecionar chat
    const handleSelecionarChat = (chat) => {
        setChatSelecionado(chat);
        setMensagens([]);
        fetchMensagensDoChat(chat.codChat);
        // Limpa o parâmetro da URL para não tentar iniciar chat novamente ao selecionar outro
        if (destinatarioIdParam) {
            navigate('/chats', { replace: true });
        }
    };

    // Handler para enviar mensagem
    const handleEnviarMensagem = async () => {
        if (!novaMensagem.trim() || !chatSelecionado || !loggedUser) {
            alert('Selecione um chat e digite uma mensagem.');
            return;
        }
        const codDestinatario = chatSelecionado.Codpessoa1 === loggedUser.id
                                ? chatSelecionado.Codpessoa2
                                : chatSelecionado.Codpessoa1;
        try {
            // Envia a mensagem
            const mensagemEnviada = await enviarMensagem(loggedUser.id, codDestinatario, novaMensagem);
            
            // Adiciona a mensagem enviada à lista local
            setMensagens(prev => [...prev, { 
                ...mensagemEnviada, 
                codPessoa: loggedUser.id, // Garante que o remetente está correto
                nomePessoa: loggedUser.nome // Adiciona nome para exibição imediata
            }]);
            setNovaMensagem(''); // Limpa o input

            // Atualiza a lista de chats para refletir a nova última mensagem e ordem
            const chatsAtualizados = await buscarChats(loggedUser.id);
            setChats(chatsAtualizados);

        } catch (err) {
            console.error('Erro no componente ao enviar mensagem:', err);
            // Erro já tratado com alert na função enviarMensagem
        }
    };

    // Handler para deletar chat
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
                // Erro já tratado com alert
            }
        }
    };

    // Obtém nome do outro participante
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

            <div className="chat-layout card">
                {/* Lista de Chats */}
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
                                        {/* Idealmente, a API traria a última mensagem */}
                                        {/* <p>{chat.ultimaMensagem || '...'}</p> */}
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

                {/* Janela do Chat Ativo */}
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
                                            key={msg.codMensagem} // Assumindo que a API retorna codMensagem
                                            className={`message-item ${msg.codPessoa === loggedUser?.id ? 'sent' : 'received'}`}
                                        >
                                            <p>{msg.texto}</p>
                                            {/* Opcional: Adicionar timestamp */}
                                            {/* <small>{new Date(msg.dataHora).toLocaleTimeString()}</small> */}
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
                                    rows="1" // Começa com 1 linha
                                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarMensagem(); } }}
                                />
                                <button type="submit" className="btn btn-primary" disabled={!novaMensagem.trim()}>Enviar</button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                             {/* Ícone SVG simples */} 
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <p>Selecione uma conversa ao lado ou inicie uma nova a partir de um anúncio.</p>
                        </div>
                    )}
                </div>
            </div>
             {/* Estilos específicos inline (poderiam ir para um CSS) */}
             <style>{`
                .alert { padding: var(--spacing-unit); margin-bottom: var(--spacing-unit); border: 1px solid transparent; border-radius: var(--border-radius); }
                .alert-danger { color: var(--danger-color); background-color: rgba(var(--danger-color-rgb, 220, 53, 69), 0.1); border-color: rgba(var(--danger-color-rgb, 220, 53, 69), 0.2); }
                .text-muted { color: var(--secondary-color) !important; }
                .btn { /* Estilo base */
                    display: inline-block; font-weight: 400; line-height: 1.6; text-align: center; vertical-align: middle; cursor: pointer; user-select: none; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; border-radius: var(--border-radius); transition: all .15s ease-in-out;
                }
                .btn-primary { color: #fff; background-color: var(--primary-color); border-color: var(--primary-color); }
                .btn-secondary { color: #fff; background-color: var(--secondary-color); border-color: var(--secondary-color); }
                .btn:hover { filter: brightness(0.9); }
             `}</style>
        </div>
    );
};

export default Chats;

