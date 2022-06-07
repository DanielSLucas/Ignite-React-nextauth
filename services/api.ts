import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: any[] = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  // Se uma requisição retornar uma resposta com erro 401
  if (error.response?.status === 401) {
    // e o código for "token.expired"
    if (error.response.data.code === "token.expired") {
      // pegar os cookies mais novos
      cookies = parseCookies();
      
      // pegar o refresh token
      const { 'nextauth.refreshToken': refreshToken } = cookies;
      // dados da requisição que falhou
      const originalConfig = error.config;

      // Se ainda não começou o processo de refresh do token, começar
      if (!isRefreshing) {
        // flag que indica que está fazendo o refresh
        isRefreshing = true

        // requisção a API para o refresh do token
        api.post('refresh', {
          refreshToken,
        }).then(response => {
          // novo token retornado
          const { token } = response.data
  
          // atualização dos cookies com os tokens
          setCookie(undefined, "nextauth.token", token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days (expiration)
            path: "/", // accessible from all pages
          });
          setCookie(undefined, "nextauth.refreshToken", response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days (expiration)
            path: "/", // accessible from all pages
          })
    
          // atualização do header padrão de autorização
          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          // Reafazer as requisições que falharam com o novo token gerado
          failedRequestsQueue.forEach(request => request.onSuccess(token))
          // zerar a fila
          failedRequestsQueue = [];
        }).catch(err => {
          // caso não tenha sido possivel gerar um novo token, repassar o erro
          // para as requisições que na fila
          failedRequestsQueue.forEach(request => request.onFailure(err))
          failedRequestsQueue = [];
        }).finally(() => {
          // flag que indica que o refresh terminou
          isRefreshing = false;
        })
      }
      // Retorno de um promise pois não podemos usar async..await com os interceptors do axios
      return new Promise((resolve, reject) => {
        // Adicionando a request que falhou para fila
        failedRequestsQueue.push({
          // método caso um novo token tenha sido gerado
          onSuccess: (token: string) => {
            // atualiza o header de autoriação com um token válido
            originalConfig.headers['Authorization'] = `Bearer ${token}`;
            // refaz a request com as configuções originais
            resolve(api(originalConfig))
          },
          // método caso aconteça uma falha na geração de um novo token
          onFailure: (err: AxiosError) => {
            // repassa o erro 
            reject(err)
          },
        })
      })
    }  else {

    }
  }
})