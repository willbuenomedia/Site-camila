import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
// Cole aqui os dados do Supabase (Project Settings > API)
export const sb=createClient('COLE_AQUI_A_URL_DO_PROJETO','COLE_AQUI_A_ANON_KEY');
// Tratamentos iniciais (usados até a Dra. editar no painel)
export const DEF=[
{title:'Lifting temporal',descr:'Uma abordagem delicada para o terço superior do rosto, avaliada caso a caso.'},
{title:'Botox',descr:'Suaviza linhas de expressão preservando a sua naturalidade.'},
{title:'Preenchimento',descr:'Equilíbrio de contornos e volumes, respeitando as proporções do seu rosto.'},
{title:'Rinomodelação',descr:'Planejamento cuidadoso do perfil, sempre com avaliação prévia.'},
{title:'Fios de PDO',descr:'Indicados após avaliação individual, para quem busca sustentação da pele.'},
{title:'Protocoll',descr:'Cuidado com a qualidade da pele, em um protocolo pensado para você.'}];
