import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buscarChats, enviarMensagem } from './CRUD/ChatCRUD';
import { buscarPessoas } from './CRUD/PessoaCRUD';
import { buscarMensagens } from './CRUD/MensagemCRUD';
import './CSS/Chat.css'; // Certifique-se de ter esse arquivo de estilo CSS

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [chatSelecionado, setChatSelecionado] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [mensagens, setMensagens] = useState([]);

  useEffect(() => {
    const loggedUserId = Number(localStorage.getItem('codPessoa'));

    if (loggedUserId) {
      fetchLoggedUser(loggedUserId);
      fetchChats(loggedUserId);
      fetchUsuarios(loggedUserId);
    }
  }, []);

  const fetchLoggedUser = async (userId) => {
    try {
      const pessoas = await buscarPessoas();
      const user = pessoas.find((pessoa) => pessoa.CodPessoa === userId);
      setLoggedUser(user);
    } catch (error) {
      console.error('Erro ao buscar usuário logado:', error);
    }
  };

  const fetchChats = async (userId) => {
    try {
      const allChats = await buscarChats(userId);
      const userChats = allChats.filter(
        (chat) => chat.Codpessoa1 === userId || chat.Codpessoa2 === userId
      );
      setChats(userChats);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
    }
  };

  const fetchUsuarios = async (userId) => {
    try {
      const pessoas = await buscarPessoas();
      const otherUsers = pessoas.filter((pessoa) => pessoa.CodPessoa !== userId);
      setUsuarios(otherUsers); // Garante que o estado de usuários está correto
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleEnviarMensagem = async () => {
    if (mensagem.trim() && destinatario) {
      if (loggedUser && destinatario !== loggedUser.CodPessoa) {
        try {
          // Enviar a mensagem
          await enviarMensagem((mensagem + " - enviado por " + loggedUser.nome), loggedUser.CodPessoa, destinatario);
          setMensagem('');
          
          // Atualiza as mensagens para o chat selecionado
          if (chatSelecionado) {
            // Recarregar as mensagens do chat selecionado
            exibirMensagens(chatSelecionado);
          } else {
            // Caso não haja chat selecionado, recarrega todos os chats
            fetchChats(loggedUser.CodPessoa);
          }
        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
        }
      } else {
        alert("Você não pode enviar mensagem para si mesmo.");
      }
    } else {
      alert("Selecione um destinatário e escreva uma mensagem.");
    }
  };
  
  const exibirMensagens = async (chatId) => {
    const chat = chats.find((chat) => chat.codChat === chatId);
  
    if (chat) {
      try {
        const mensagensData = await buscarMensagens(chat.codChat);
        if (mensagensData && mensagensData.length > 0) {
          // Verificando se os usuários foram carregados corretamente
          if (usuarios.length > 0) {
            const mensagensComNome = mensagensData.map(msg => {
              const remetente = usuarios.find(pessoa => pessoa.CodPessoa === msg.Codpessoa);
              return { 
                ...msg, 
                nomePessoa: remetente ? remetente.nome : 'Desconhecido' 
              };
            });
            setMensagens(mensagensComNome);  // Atualiza o estado com as mensagens do chat
          } else {
            console.warn('Usuários não carregados corretamente.');
            setMensagens([]);
          }
        } else {
          setMensagens([]);  // Se não houver mensagens, limpa o estado
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      }
    } else {
      setMensagens([]);  // Se o chat não for encontrado, limpa as mensagens
    }
  };

  return (
    <div>
      <h2>Chats</h2>
      
      <div>
        <label>Escolha o destinatário:</label>
        <select
          value={destinatario}
          onChange={(e) => setDestinatario(e.target.value)}
        >
          <option value="">Selecione um destinatário</option>
          {usuarios.map((usuario) => (
            <option key={usuario.CodPessoa} value={usuario.CodPessoa}>
              {usuario.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={handleEnviarMensagem}>Enviar</button>
      </div>

      <div>
        <h3>Meus Chats</h3>
        {chats.length === 0 ? (
          <p>Você não tem chats.</p>
        ) : (
          <div>
            {chats.map((chat) => {
              const outroUsuario = chat.Codpessoa1 === loggedUser?.CodPessoa 
                ? chat.Codpessoa2 
                : chat.Codpessoa1;
              const nomeDestinatario = usuarios.find(usuario => usuario.CodPessoa === outroUsuario)?.nome || 'Desconhecido';
              return (
                <div
                  key={chat.codChat}
                  onClick={() => {
                    setChatSelecionado(chat.codChat);
                    exibirMensagens(chat.codChat);
                  }}
                >
                  <h4>Chat com {nomeDestinatario}</h4>
                  {chatSelecionado === chat.codChat && (
                    <div>
                      {mensagens.length > 0 ? (
                        mensagens.map((msg) => (
                          <div key={msg.codMensagem}>
                            <p> {msg.texto}</p>
                          </div>
                        ))
                      ) : (
                        <p>Sem mensagens ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Link to="/menu"> <button className="login-btn">Retornar ao menu</button> </Link>
    </div>
  );
};

export default Chats;
