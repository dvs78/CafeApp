--
-- PostgreSQL database dump
--

\restrict qMILUmZgRODKIxBtawqxGIE5kbM8Rxm0ApmtpEDdckXhYAECn4occVfHDBuH7py

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente text NOT NULL
);


--
-- Name: fazendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fazendas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fazenda text NOT NULL,
    cliente_id uuid
);


--
-- Name: fazendas_relatorio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fazendas_relatorio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_relatorio text NOT NULL,
    fazenda_id uuid
);


--
-- Name: lavouras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lavouras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    cliente_id uuid NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    fazenda_id uuid
);


--
-- Name: produtos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produtos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    ativo boolean DEFAULT true NOT NULL
);


--
-- Name: realizado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.realizado (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    safra text NOT NULL,
    lavoura text NOT NULL,
    servico text NOT NULL,
    data date NOT NULL,
    status text NOT NULL,
    produto text,
    unidade text,
    quantidade numeric(10,2),
    usuario_id uuid,
    cliente_id uuid,
    criado_em timestamp without time zone DEFAULT now()
);


--
-- Name: safras_cadastrada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safras_cadastrada (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    safra text NOT NULL,
    safra_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    fazenda_id uuid NOT NULL,
    lavoura_id uuid NOT NULL,
    criado_em timestamp without time zone DEFAULT now()
);


--
-- Name: safras_lista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safras_lista (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT safras_id_not_null NOT NULL,
    nome text CONSTRAINT safras_nome_not_null NOT NULL,
    ativo boolean DEFAULT true CONSTRAINT safras_ativo_not_null NOT NULL
);


--
-- Name: servicos_lista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.servicos_lista (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    cliente_id uuid NOT NULL
);


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id, cliente) FROM stdin;
9beb9f62-6de8-4193-ab68-fbd6fc7352ec	Grupo Palheta
118cdfd6-96d6-46e8-994b-7b000c7b1b7c	Marcus Veiga
096da0b8-b4cf-4dd4-96df-782c9febb2f1	Agrocoffee
7bed8728-c2d9-4606-854c-4841eb1acd6b	José Marcos
fbfcfbfa-f660-46cb-804a-34a4ace4aa96	Douglas
\.


--
-- Data for Name: fazendas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fazendas (id, fazenda, cliente_id) FROM stdin;
eddf70d8-215f-4065-8fed-9d392ccec032	Agrocoffee Sociedade Agrícola LTDA	096da0b8-b4cf-4dd4-96df-782c9febb2f1
411f747c-9cba-49e9-87f1-76de7233265c	Agronegócios Oliveira	fbfcfbfa-f660-46cb-804a-34a4ace4aa96
\.


--
-- Data for Name: fazendas_relatorio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fazendas_relatorio (id, nome_relatorio, fazenda_id) FROM stdin;
920c03b1-adb4-4f3d-b635-80240835502c	Agrocoffee	eddf70d8-215f-4065-8fed-9d392ccec032
4120ed1a-3255-4eb2-9642-da77ca70219a	Queima Capote	411f747c-9cba-49e9-87f1-76de7233265c
d79566d0-84ea-456a-a963-1ad450659f8f	Sapé	411f747c-9cba-49e9-87f1-76de7233265c
76a1ab13-64b0-47a7-bbb3-20d57f6134e9	Sertãozinho	411f747c-9cba-49e9-87f1-76de7233265c
6fc5ebb0-44a4-41ed-b2cf-fd4ea272d4c7	Sossêgo	411f747c-9cba-49e9-87f1-76de7233265c
b81069ff-1a7a-424b-ac9f-e0f9d9ee9a94	Três Barras	411f747c-9cba-49e9-87f1-76de7233265c
\.


--
-- Data for Name: lavouras; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lavouras (id, nome, cliente_id, ativo, fazenda_id) FROM stdin;
6fcef3ae-145a-46fb-a193-60c093d7b3a7	Flávia 144	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
f2a551a2-13c0-4572-be1d-67047a23ad04	Flávia 99	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
b422c891-6093-4172-a57d-8ed2afbfe236	Flávia Geisha	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
a806ac66-902f-4c82-988a-2622d09f3c39	Flávia MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
56f21edd-734e-45d1-a3b5-9a6f2eca8b04	Jaci Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
6f3fd64f-002a-43ec-b2a0-fce8ee4dfeb2	Ronaldo 24-137	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
2562e9de-ca68-4ac6-a938-ee56311e4efa	Ronaldo Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
0fe16f69-cb64-4239-a935-117fedf9925f	Carlinho	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
ca13aa91-5b9c-4bc9-9df9-8dbd70ffe0e1	Suelly	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
4ab75ba6-f435-4832-8c56-9d5e3d36314e	Tonho	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
82d37f43-7aa2-4a06-944b-88840780b6db	Canjica Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
2916575a-a7ce-477d-86b3-90e1896f3809	Casa 2 SL	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
816cdaa3-192f-471a-8ba1-d519fb928359	Curral MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
cd00dca3-f8fb-4313-8a3e-efa624d2475a	Estrada 62	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
eac8ac0f-fcf7-4ee5-a108-2e43e2188736	Eucalipto 144	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
f18f99e5-dba6-41e7-8522-cc5eb0e19ee4	Eucalipto 62	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
ed39e919-dcd9-4d3f-956f-7906b7930c01	Eucalipto MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
49d49fac-4945-4c37-ab3f-d579318c9adb	Pimenta 2 SL	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
d4a9eed1-6a11-42ce-bccf-8d12eab31a04	Pimenta Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
8c6c2923-2ee3-4663-a547-a281e0d928ac	Pimenta MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t	eddf70d8-215f-4065-8fed-9d392ccec032
1255e23f-8842-468a-84a7-c23bfdbbf8eb	QC Esqueletado	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
1a3ab0cd-1790-4be3-8a91-e0d041ee5b9b	QC Formação	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
37e8c839-214d-4dfe-863c-a412c7ffc416	QC Nova	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
f64d7b8d-fbae-490e-97ce-c9b3895597da	QC Velha	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
2f2759c7-cb67-4470-b95a-0a8db8e4495d	SA Catuaí	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
88b4534c-17b1-4352-ad81-3cceed25a031	SA Mundo novo	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
438b4182-6bd6-4dc9-87b4-d8aabb4d37ce	SE 25	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
7fb71a16-cc0e-4ad4-8c8e-e3018afd4de5	SE 4473	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
44ce4d9c-946c-4af0-b1f5-6f9bc6faea8f	SE Mangueira nova	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
9adcb2c5-35c6-498d-948c-d60aa9563dde	SE Mangueira velha	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
6a1ea0f6-106b-4d22-b3dc-e05cde03e552	SE Novinha	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
b760aaf4-22ce-40e6-a5fa-933406f3d51c	SE Toninho	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
5d1cb36c-d3b2-4391-b7eb-cf72fb19d43b	SE Zé maria	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
d9466c48-f485-4725-a7d2-97bb84157754	SE Zélia lavrinha	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
402adaaa-178e-4b1a-a465-14f3d7d26b80	SE Zélia nova	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
a93ca23c-29e9-42e9-be69-fbb1670f1151	SO 01	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
196160ec-ea30-499b-a88f-34df003dcb9f	SO 02	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
9103fed3-a878-4897-b49e-31787e65d634	TB Nova	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
075537c6-3229-4ebd-98a2-dc05cf745e82	TB Velha	7bed8728-c2d9-4606-854c-4841eb1acd6b	t	411f747c-9cba-49e9-87f1-76de7233265c
\.


--
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.produtos (id, nome, ativo) FROM stdin;
83087db1-a895-459c-abb8-4b092914dfae	10-50-00 (map s/micro)	t
a9b69252-bb8a-43c3-b8af-b1cfd328ebd1	21-00-21 (na)	t
e56fb605-f39e-4291-8892-65b301e9f7b4	30-00-00 (na)	t
b3d8b962-760d-4ef3-976e-32bd93fe3b68	33-00-00 (na)	t
b1df957b-1d2d-4827-8c75-31fb901851f5	Amostra de folhas	t
af1cb8dc-ae0b-49af-9f1b-111ab8577e00	Amostra de solo	t
a23c6065-f26b-404a-a803-aacd62283b98	Apanhadores	t
b4a58d29-2b06-4f62-997f-8f6ee2d05083	Boro granulado (10%)	t
23fce4dd-298d-4b36-9d0c-7a412b5d8fb1	Calagem (su)	t
b2c43243-ed35-4885-beea-08d24a5dcc31	Calcário dolomítico	t
21d72fe8-5dba-4ca6-88af-8563433e434c	Chegador de terra	t
55999098-4491-4d6f-bba9-b402836c1b12	Colhedora	t
8a93877f-69d7-4c35-a59e-98370d4e0d86	Decotadeira	t
3e299c52-41f2-43db-8f14-f15cf04ce1b6	Enleirador	t
018b25f6-5841-4a4f-ad29-fa698960737c	Esqueletadeira	t
a344f3b0-d0f0-4633-a0a6-82048898cb26	Esterco de curral	t
3e3472b1-a239-48d6-9f5a-f223e0e85f71	Esterco de galinha	t
5eaed074-c6da-47fe-9106-9e2d2d12bded	Gesso agrícola	t
41b6c79e-4e13-4e49-825a-172de6f8fd69	Grade leve	t
64afeacd-153a-4597-869d-d2467c6376e9	Luva	t
b6554709-63ce-4420-a851-b90fd6be7fe5	Manual	t
a928807f-66c8-4e24-ba66-610ecd378388	Map s/micro	t
98eeb4e7-4e2c-403d-838e-beb9bfa23372	Mudas	t
fa37bb80-4a25-4a4b-a255-d09165da64cf	Nitrabor	t
a8259392-6137-4e34-ad89-d9bf583a2215	Palha de café	t
7f24bed9-b1db-4be6-a198-b34ee344476b	Roçadeira	t
b6ccd6e6-9045-4135-ad22-4ccb96124d2b	Subsolador de 3 hastes	t
0c75901c-d64c-48ea-8c58-74ad15af46da	Sulcador	t
636266e0-0b40-4377-8b8c-a79eb4f97af8	Trincha	t
0d567718-4738-44fe-bbf9-457f9755cb2b	Varredora	t
65d313d7-23c0-42d3-a022-302d9986fb03	Subsolador	t
e0dbc498-7ee0-4dfb-8008-773f5f8217e7	Grade pesada	t
55028d48-e2c0-471b-b3a4-d15a5b246051	Braquiária	t
92e366d6-17d3-4c4b-a646-d2a2d35cabaf	Receita	t
\.


--
-- Data for Name: realizado; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.realizado (id, safra, lavoura, servico, data, status, produto, unidade, quantidade, usuario_id, cliente_id, criado_em) FROM stdin;
750543fe-b51c-493a-b453-b4807e2423b3	Safra 25/26	Jaci Arara	1 adubação química	2025-09-27	realizado	21-00-21 (na)	Kg	9700.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
e3d63a44-5439-4f39-bf57-a08151d152b2	Safra 25/26	Flávia 99	1 adubação química	2025-09-30	realizado	21-00-21 (na)	Kg	5500.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
d7ccdfbe-26bc-42bd-97f2-df854495d419	Safra 25/26	Flávia MN	1 adubação química	2025-09-30	realizado	21-00-21 (na)	Kg	9400.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
5d7182e0-08f2-4cb4-91a0-857479c5a71f	Safra 25/26	Flávia 144	1 adubação química	2025-09-29	realizado	21-00-21 (na)	Kg	8010.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
fdb032e3-1fd1-47d4-ba44-8655a32480b0	Safra 25/26	Tonho	1 adubação química	2025-10-01	realizado	21-00-21 (na)	Kg	6080.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
9031f055-0184-4a5e-9e23-cd836b6fa958	Safra 25/26	Suelly	1 adubação química	2025-10-08	realizado	21-00-21 (na)	Kg	6150.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
651d2579-a49c-4728-b749-3c5491ad6034	Safra 25/26	Carlinho	1 adubação química	2025-10-08	realizado	21-00-21 (na)	Kg	750.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
07f6dd26-44e6-4b5e-9992-da2d50eb4ccf	Safra 25/26	Eucalipto 144	1 adubação química	2025-10-04	realizado	21-00-21 (na)	Kg	16000.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
27d11aeb-87c5-490c-8628-1be099b3e20b	Safra 25/26	Casa 2 SL	1 adubação química	2025-10-07	realizado	21-00-21 (na)	Kg	3500.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
0d9d17e4-6f8c-420d-8c67-344ba72d53f5	Safra 25/26	Pimenta 2 SL	1 adubação química	2025-10-07	realizado	21-00-21 (na)	Kg	2250.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
21c796c2-016d-4131-ac67-f7b050ecdefd	Safra 25/26	Pimenta MN	1 adubação química	2025-10-06	realizado	21-00-21 (na)	Kg	6500.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
9265787c-8379-481e-b56d-9f819aca0875	Safra 25/26	Curral MN	1 adubação química	2025-10-06	realizado	21-00-21 (na)	Kg	6200.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
5f6e92e0-17c8-437f-a407-6793f82d8020	Safra 25/26	Eucalipto MN	1 adubação química	2025-10-06	realizado	21-00-21 (na)	Kg	5650.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
f4484d8a-0496-4445-976d-d92b18cb8550	Safra 25/26	Eucalipto 62	1 adubação química	2025-10-06	realizado	21-00-21 (na)	Kg	2700.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
6e24ba0d-03af-4407-94c9-e14a48a7d18c	Safra 25/26	Estrada 62	1 adubação química	2025-10-06	realizado	21-00-21 (na)	Kg	2100.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
6eee303b-7a39-48e4-a666-571b209b44d7	Safra 25/26	Pimenta Arara	1 adubação química	2025-10-07	realizado	21-00-21 (na)	Kg	7300.00	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
aa7277e7-6cb8-44fe-aa70-f9672823416a	Safra 25/26	Canjica Arara	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
5be19af5-34ae-4755-bbbf-3efe6743735c	Safra 25/26	Carlinho	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
376c5fe5-3b74-4eb8-8d79-3691781b2f41	Safra 25/26	Casa 2 SL	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
41bbd7a2-862f-492f-8961-14045dab363b	Safra 25/26	Curral MN	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
20b3158b-5619-4919-8604-8fa6b5ddb737	Safra 25/26	Estrada 62	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
244d267c-ea3a-42ed-875d-30027c0a29ae	Safra 25/26	Eucalipto 144	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
bca48d4e-8358-43fa-b553-10aef6fbc473	Safra 25/26	Eucalipto 62	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
8244aed0-0f19-41b9-b45c-cb56e12c910b	Safra 25/26	Eucalipto MN	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
204a0458-536d-44bd-9928-76900713cce4	Safra 25/26	Flávia 144	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
31b6bc85-c0a6-4910-abd6-d50a645c80a3	Safra 25/26	Flávia 99	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
c3860de7-b240-4a0d-8a81-98b0dd2e4543	Safra 25/26	Flávia MN	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
349f5ee3-452c-48c7-8849-49644266b3cb	Safra 25/26	Jaci Arara	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
468f7aa0-8eb8-4693-b0e7-a7e02d707629	Safra 25/26	Pimenta 2 SL	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
dff15a8b-94ce-48ad-93e5-302f0e0ca0ab	Safra 25/26	Pimenta Arara	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
a977bdd4-038e-4c58-8203-0f8156611abb	Safra 25/26	Pimenta MN	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
371a5267-c879-424a-9664-313b55fe8fe2	Safra 25/26	Ronaldo 24-137	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
ba088e4c-0e06-4332-a8b5-a99434d182ae	Safra 25/26	Ronaldo Arara	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
fde8ef00-408b-4590-96d1-a5d5d6bbbfc8	Safra 25/26	Suelly	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
425d86ba-924a-44a3-9292-f5dab7842360	Safra 25/26	Tonho	1 chegar cisco	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
a74b9c14-6da6-4f66-98ba-6d4d7eb1e0a7	Safra 25/26	Canjica Arara	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
37863bb0-0890-4092-94b1-ffbde2a49064	Safra 25/26	Carlinho	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
a77d322d-a677-4644-9311-ed00421e762a	Safra 25/26	Casa 2 SL	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
b6ba0b74-cec2-4077-8341-cfd11246b591	Safra 25/26	Curral MN	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
fe394a5c-aef2-469a-b954-95ccec66e6ba	Safra 25/26	Estrada 62	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
e954f58e-20a0-4c25-b391-c67d46d52ca2	Safra 25/26	Eucalipto 144	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
06d09071-e744-4f55-b92e-9373516eef3e	Safra 25/26	Eucalipto 62	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
5a8bd777-f68a-42f5-a70b-f0b96dec4629	Safra 25/26	Eucalipto MN	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
0ee6520d-1476-453e-9480-cba730914fb8	Safra 25/26	Flávia 144	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
e5d1256f-0439-4818-a90a-3e22964eda7d	Safra 25/26	Flávia 99	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
d4cb84ea-5289-4b44-a3dd-eeb5346401ae	Safra 25/26	Flávia MN	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
042868e5-36f0-4135-b426-62e665da64c1	Safra 25/26	Jaci Arara	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
d7154943-2146-450d-bde0-c7fa3a1161dd	Safra 25/26	Pimenta 2 SL	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
e431d932-54a6-41be-9a18-620080d4d8cd	Safra 25/26	Pimenta Arara	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
ca88fa4e-7cbc-49b1-a690-3be66d3f9d0c	Safra 25/26	Pimenta MN	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
6a9e3f75-b8b5-42dd-bb51-b044a05a1302	Safra 25/26	Ronaldo 24-137	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
2058a365-5ed7-4ef2-87d5-5cf6ec5190da	Safra 25/26	Ronaldo Arara	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
71ae1920-d020-4b4e-9e4c-0b1d35504faa	Safra 25/26	Suelly	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
3f98a5ff-d28d-404d-ba44-82fe9c2e4074	Safra 25/26	Tonho	1 herbicida (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
b8ae5a0f-5b36-41c8-99e0-5ddcdd8df5fa	Safra 25/26	Carlinho	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
22771df8-951b-49b3-ac63-c19e2d96cc9f	Safra 25/26	Casa 2 SL	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
3482fb99-dd0c-4c91-ba50-667af357dde4	Safra 25/26	Curral MN	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
693f9fd8-f69e-4dee-b0e4-9b9193dee14a	Safra 25/26	Estrada 62	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
e958d090-1e7b-4986-b05a-55f89a6ae025	Safra 25/26	Eucalipto MN	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
4842ffad-334b-4be1-8869-88a274ca1fdd	Safra 25/26	Flávia Geisha	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
e04b8960-27a2-4f11-80e2-ef7ffabb1a4e	Safra 25/26	Flávia MN	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
b0791245-2635-4621-bae7-abfdccee26b7	Safra 25/26	Pimenta 2 SL	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
817d0c6a-7b58-44b0-b798-fa80ab65ea24	Safra 25/26	Pimenta Arara	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
bcf62dad-30b1-47d3-963e-39017873eef5	Safra 25/26	Pimenta MN	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
03e8bb7a-568e-43f0-9e9d-603fab715b7e	Safra 25/26	Ronaldo 24-137	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
4b59aac3-2079-48a1-b541-302ce11e983c	Safra 25/26	Ronaldo Arara	Gessagem (at)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
32e27c83-9ac0-4ea1-9999-0b0e994eca64	Safra 25/26	Canjica Arara	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
4cb0f696-cd61-43ee-9036-59c403b9b74a	Safra 25/26	Estrada 62	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
4a12c8b8-6c45-4951-a69a-a9112bf00c5e	Safra 25/26	Eucalipto 144	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
7f50b8bd-d1a6-4652-8f9a-f0e4f657e754	Safra 25/26	Eucalipto 62	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
18846290-984c-4fde-996d-f7f3cc443c3c	Safra 25/26	Eucalipto MN	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
be1b6d39-446a-4309-b7f1-3d43490b1e7e	Safra 25/26	Flávia 144	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
3810c6ce-949e-444e-be50-c1d30eb4ea1d	Safra 25/26	Flávia MN	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
d9c7d84b-0d65-462d-8ac1-5095fa88fa6b	Safra 25/26	Pimenta MN	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
3f5298d7-7980-4bf2-a172-83440e5a6525	Safra 25/26	Suelly	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
119e5b3a-ab5b-4735-8fe9-f38833a6c834	Safra 25/26	Tonho	Magnésio (ps)	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
9a2aa08b-d9db-441e-84f2-9643630c48a9	Safra 25/26	Canjica Arara	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
7a589271-5698-4d10-adb1-a9b5128f5118	Safra 25/26	Casa 2 SL	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
52a1ccc4-1b2e-4637-994b-0a496fe9e3c9	Safra 25/26	Curral MN	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
c5836c46-a0a4-40c2-936a-ff5646830713	Safra 25/26	Estrada 62	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
a371861b-5960-471c-b22b-baf296f399d2	Safra 25/26	Eucalipto 144	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
94c2411a-0f4b-4b3e-b8c8-e88ec0efaabd	Safra 25/26	Eucalipto 62	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
8bf2047f-76d3-480e-9429-a8a9a5470eb6	Safra 25/26	Eucalipto MN	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
98fbb05d-ed93-4c73-9e8f-3fb156bb5827	Safra 25/26	Flávia 144	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
f64d4652-82e8-4938-8b21-9004b25055aa	Safra 25/26	Flávia 99	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
71d9e2ff-64df-418b-b3fe-e890f23d8d25	Safra 25/26	Flávia MN	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
8a2bc7af-0f56-472d-8a86-e69751fe0356	Safra 25/26	Jaci Arara	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
55a8d7f2-9fd1-4d5b-a44e-33bbb1bb1c82	Safra 25/26	Pimenta 2 SL	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
6ec39c42-c571-40a5-8164-154858ee2810	Safra 25/26	Pimenta Arara	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
978c0733-ddc7-4965-9631-20b9be9c5c5c	Safra 25/26	Pimenta MN	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
681c67bb-3a41-431a-a190-55c781560959	Safra 25/26	Suelly	Limpeza dos brotos velhos	2025-11-18	cancelado	\N	\N	\N	d767fa9a-9093-422c-a678-c33e0c6308eb	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
b5339ae9-f970-48bd-bc07-8545c7020b6b	Safra 25/26	Canjica Arara	1 adubação química	2025-10-03	realizado	21-00-21 (na)	Kg	70000.00	539bca26-5145-43cb-a02b-613f2ca7cbb1	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-08 18:51:47.48211
\.


--
-- Data for Name: safras_cadastrada; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.safras_cadastrada (id, safra, safra_id, cliente_id, fazenda_id, lavoura_id, criado_em) FROM stdin;
\.


--
-- Data for Name: safras_lista; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.safras_lista (id, nome, ativo) FROM stdin;
24c70e2c-298d-4d20-8601-205768633741	Safra 25/26	t
1cf6f2bb-f8a2-4c6b-9da3-1f0143c3c90e	Safra 26/27	t
\.


--
-- Data for Name: servicos_lista; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.servicos_lista (id, nome) FROM stdin;
049713cf-8b4a-4c32-9b3c-ea1238392e66	1 adubação orgânica (su)
bc2c8493-d1c5-4677-849e-42549bab1a8b	1 adubação química
97ded35b-cdf0-4f84-a851-9cfd67a7f4b6	1 amostra de folhas
4590e50b-f0dc-4a45-b34b-5a05af58eb76	1 bicho mineiro
46a7f1aa-ebbd-4577-9b38-e2c1e22aaa39	1 catação de cipó
cd8b67db-2989-448c-a198-d49a53971d1c	1 derriça manual
1fe471de-b126-4ad7-9d51-284f3be986e8	1 derriça mecanizada
b625de63-9a3e-430d-814a-50e43e8c8354	1 desbrota
83f760cd-4d3d-493d-a522-f6cd46975e47	1 drench
b1f460cc-3764-4535-97a0-34e3274c93bc	1 herbicida (at)
3a899888-6b3d-4460-b5be-16342a35c273	1 herbicida (tr)
763db9c5-02f6-4e52-9e29-a138064e205c	1 pulverização
c397c720-6f7d-4b00-aea0-bbc07dea6268	1 roçada
f7678366-d0d4-496e-9727-502384d0659e	1 sopração
9d3ff808-df2d-4e1b-906d-129fbedceabf	1 sulcagem
e86fabd2-2755-45cc-adb8-19c8c27898ad	1 varrição manual
a1fc92b8-a3c9-4c8b-aaa3-a9bd423b166d	2 adubação orgânica (su)
fdd0f269-f91a-4a2e-83aa-475eed23dbb9	2 adubação química
0ea94c41-40bc-41ca-91d7-b4cd44c6f623	2 amostra de folhas
edbf3d06-d54e-4d83-b835-28dbb5a0fe47	2 catação de cipó
69e76831-7609-4198-a66f-cdf6287f9189	2 derriça mecanizada
842fb58c-0516-4d30-b2b7-4ffd35cf7fde	2 desbrota
5a7167de-b398-4dd5-a15e-8a5304ed8717	2 drench
8e513e14-643d-470a-b498-f76cd6aaca88	2 herbicida (at)
8f7ad3e9-9d8e-4b9c-9cc2-508482d8324c	2 herbicida (tr)
1c918cad-476c-4bf9-b581-44e5a2082197	2 pulverização
7a64e12f-bd23-45bc-ba4a-d4cb1a723bfc	2 roçada
cf13e3c6-5204-480d-b87a-f4faa4125928	2 sulcagem
429b7e61-4c7f-4b6d-8d10-26e0cee75337	3 adubação orgânica (su)
1267c708-150d-466f-a094-fe39fdcac2a3	3 adubação química
5963c341-4abe-4586-9c17-4cad69e3adaf	3 catação de cipó
365892a7-3f49-44d3-af1d-2b68f095ebc2	3 desbrota
14487d50-60eb-438f-9f09-4c768e767a81	3 herbicida (at)
24ddb0e9-7a32-48a7-b3a7-20399707877d	3 herbicida (tr)
28a94194-0fa1-48fb-8c03-cc1fb7c009f5	3 pulverização
ed928f38-9958-4119-aeb8-9a4b94865d28	3 roçada
561aae1d-cfd1-4fe6-a938-0eaeb53123d0	4 adubação química
ccbc1ec0-fe94-431b-9d4d-1463d73eabb0	4 catação de cipó
5b76fa29-f15a-42ad-bf07-9259b1a2f92a	4 herbicida (at)
1da29ed8-a442-48d8-b587-d241caeba747	4 herbicida (tr)
098c4e52-3086-42ba-8dfa-75f83019dacb	4 pulverização
51d343b1-7fb2-43e0-87d1-f3829b542912	4 roçada
d5cd5389-1927-4df5-84f6-3b0e119f8b39	5 catação de cipó
2bf05a75-207a-43c3-ac9c-7b12b8872d99	5 herbicida (tr)
74ca14d0-3eb7-420f-8bce-0b367d9ec2b9	5 pulverização
49c01497-237d-48dd-9c26-50cb3503392c	5 pulverização
138ed7bb-dca6-499a-aa70-7f6106af6aef	5 roçada
9d5bb04e-37c9-4cab-a2ed-c12231830c94	6 pulverização
472912d9-5868-498c-ac60-1d3e5905f005	7 pulverização
57ee14e7-4d3e-42d0-be3f-54c0856a3d95	Amostragem de solo - 0 a 20 cm
ea8b2226-7e5b-4622-9621-3de6c7752757	Amostragem de solo - 20 a 40 cm
a13bdf8f-08ce-423b-9bf5-bc87295431b3	Boro (ps)
cc63b6de-9845-4be6-beee-5546cceb4938	Calagem (at)
c125e57c-87a3-48b1-bd34-2aa50b751593	Calagem (su)
bbcdbe67-18c1-4eb9-8b7b-21c699b65467	Chegar terra
a6cb6428-5814-4e90-8a96-3f271c070bde	Decotar
3608b7c2-9d52-4d61-baf4-89d8be9c00a6	Esqueletar
efff0155-bb14-4a04-b463-42fe9c2d9d21	Fosfatagem (ps)
d9be9797-e921-4615-abc0-b5cb11d15166	Fosfatagem (su)
5e33fbde-815f-433d-9fb6-88ff3b4d5163	Gessagem (at)
23e78324-ded1-4fcb-9fd0-ae92e8bffe1b	Gessagem (su)
7ee0f6f4-685e-44ca-a7d8-d11de57a89f5	Gradagem leve (at)
fd752b76-319f-4ab4-a2f2-a374741d92c4	Gradagem leve (su)
e37a6624-f433-40dd-9878-6ca37b35fe07	Gradagem pesada (at)
7135b6bf-1573-4e23-896e-bf54a4bda2d2	Indutor de maturação
68fb8b38-4454-4ed0-93ad-65d88f62cd19	Limpeza dos brotos velhos
be5d3e48-0b2d-4ad7-ac79-55a39a4d7fbf	Palha de café
977b409f-c11e-4f7e-baa9-aac529c9572a	Plantio de mudas
81bf05bf-1072-44d9-90a9-e3a446653753	Replantio de mudas
9051d6fc-62de-4e86-af6c-0f78e9096cbf	Subsolagem - 2 vezes
c66ab59b-a686-49e1-b174-ca9344962f1a	1 varrição mecanizada
79763d52-b5fa-40f0-b15f-3a0c46466801	Indutor de maturação
af655781-acad-4107-9936-ddd3e48f3411	1 Subsolagem (at)
5ec4d65d-c1d4-4b18-a587-6bfb9c22b2ce	Plantio de braquiária
8a0edf8a-04d8-4876-aa9a-ed7bf58b2c18	Sem lançamento
4def44ba-3321-493a-a54a-1082c3b958d4	1 chegar cisco
5bcea896-c416-409d-997b-723786fc106a	Magnésio (ps)
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, usuario, email, senha, cliente_id) FROM stdin;
d767fa9a-9093-422c-a678-c33e0c6308eb	Carol	contato@agrocoffe.com.br	$2b$10$qRjrCnKTGgYWxukjFZOb9.CQWd47UumDg4XoEnPTRyG0nXzDrD1Uu	096da0b8-b4cf-4dd4-96df-782c9febb2f1
539bca26-5145-43cb-a02b-613f2ca7cbb1	Daniel Veiga	dvs.veiga78@gmail.com	$2b$10$dFL4dnCy6tfbUJ0wTpoXi.DT00GixqoMh3L26svVq/D5Q1pJ.iQD6	096da0b8-b4cf-4dd4-96df-782c9febb2f1
562c9d09-6ee2-400d-bb00-49ad042147fa	Bruna	bugalhaes@yahoo.com.br	$2b$10$PpYufK/8m34yH6pCegKcHeYsof8otZfvL6VQD1MnVQhO1qxX4iNXC	7bed8728-c2d9-4606-854c-4841eb1acd6b
c4958eee-c0f6-46fc-8935-3289e736ead0	Marcos	agronegociosoliveira@gmail.com	$2b$10$TDv5boNwFXmEumEQPz7EX.SsiG6DrCfSGWHkApTCgMHJ.i85ws53q	7bed8728-c2d9-4606-854c-4841eb1acd6b
\.


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: fazendas fazendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fazendas
    ADD CONSTRAINT fazendas_pkey PRIMARY KEY (id);


--
-- Name: fazendas_relatorio fazendas_relatorio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fazendas_relatorio
    ADD CONSTRAINT fazendas_relatorio_pkey PRIMARY KEY (id);


--
-- Name: lavouras lavouras_cliente_id_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lavouras
    ADD CONSTRAINT lavouras_cliente_id_nome_key UNIQUE (cliente_id, nome);


--
-- Name: lavouras lavouras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lavouras
    ADD CONSTRAINT lavouras_pkey PRIMARY KEY (id);


--
-- Name: produtos produtos_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_nome_key UNIQUE (nome);


--
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- Name: safras_cadastrada safras_cadastrada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_cadastrada
    ADD CONSTRAINT safras_cadastrada_pkey PRIMARY KEY (id);


--
-- Name: safras_lista safras_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_lista
    ADD CONSTRAINT safras_nome_key UNIQUE (nome);


--
-- Name: safras_lista safras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_lista
    ADD CONSTRAINT safras_pkey PRIMARY KEY (id);


--
-- Name: servicos_lista servicos_lista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicos_lista
    ADD CONSTRAINT servicos_lista_pkey PRIMARY KEY (id);


--
-- Name: realizado servicos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT servicos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: fazendas fazendas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fazendas
    ADD CONSTRAINT fazendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: fazendas_relatorio fazendas_relatorio_fazenda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fazendas_relatorio
    ADD CONSTRAINT fazendas_relatorio_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id);


--
-- Name: lavouras lavouras_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lavouras
    ADD CONSTRAINT lavouras_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: safras_cadastrada safras_cadastrada_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_cadastrada
    ADD CONSTRAINT safras_cadastrada_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: safras_cadastrada safras_cadastrada_fazenda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_cadastrada
    ADD CONSTRAINT safras_cadastrada_fazenda_id_fkey FOREIGN KEY (fazenda_id) REFERENCES public.fazendas(id);


--
-- Name: safras_cadastrada safras_cadastrada_lavoura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_cadastrada
    ADD CONSTRAINT safras_cadastrada_lavoura_id_fkey FOREIGN KEY (lavoura_id) REFERENCES public.lavouras(id);


--
-- Name: safras_cadastrada safras_cadastrada_safra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safras_cadastrada
    ADD CONSTRAINT safras_cadastrada_safra_id_fkey FOREIGN KEY (safra_id) REFERENCES public.safras_lista(id);


--
-- Name: realizado servicos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT servicos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: realizado servicos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT servicos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: usuarios usuarios_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qMILUmZgRODKIxBtawqxGIE5kbM8Rxm0ApmtpEDdckXhYAECn4occVfHDBuH7py

