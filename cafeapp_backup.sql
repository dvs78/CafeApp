--
-- PostgreSQL database dump
--

\restrict 5ewKgEVQH5aLZ6gYpMgdpMyfekw0qPmuV1kiql3VNseeIKV0YhK4xuxO9TDKWPk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-02 17:43:40

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

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16827)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente text NOT NULL
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16928)
-- Name: lavouras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lavouras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    cliente_id uuid NOT NULL,
    ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.lavouras OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16901)
-- Name: produtos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produtos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.produtos OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16863)
-- Name: realizado; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.realizado OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16890)
-- Name: safras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.safras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.safras OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16882)
-- Name: servicos_lista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicos_lista (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL
);


ALTER TABLE public.servicos_lista OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16848)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    cliente_id uuid NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 16827)
-- Dependencies: 218
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, cliente) FROM stdin;
8f8e1765-3fc5-4fed-87f6-4ac6ecc74729	Dr. Eduardo
9beb9f62-6de8-4193-ab68-fbd6fc7352ec	Grupo Palheta
118cdfd6-96d6-46e8-994b-7b000c7b1b7c	Marcus Veiga
096da0b8-b4cf-4dd4-96df-782c9febb2f1	Agrocoffee
\.


--
-- TOC entry 4990 (class 0 OID 16928)
-- Dependencies: 224
-- Data for Name: lavouras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lavouras (id, nome, cliente_id, ativo) FROM stdin;
6fcef3ae-145a-46fb-a193-60c093d7b3a7	Flávia 144	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
f2a551a2-13c0-4572-be1d-67047a23ad04	Flávia 99	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
b422c891-6093-4172-a57d-8ed2afbfe236	Flávia Geisha	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
a806ac66-902f-4c82-988a-2622d09f3c39	Flávia MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
56f21edd-734e-45d1-a3b5-9a6f2eca8b04	Jaci Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
6f3fd64f-002a-43ec-b2a0-fce8ee4dfeb2	Ronaldo 24-137	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
2562e9de-ca68-4ac6-a938-ee56311e4efa	Ronaldo Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
0fe16f69-cb64-4239-a935-117fedf9925f	Carlinho	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
ca13aa91-5b9c-4bc9-9df9-8dbd70ffe0e1	Suelly	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
4ab75ba6-f435-4832-8c56-9d5e3d36314e	Tonho	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
82d37f43-7aa2-4a06-944b-88840780b6db	Canjica Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
2916575a-a7ce-477d-86b3-90e1896f3809	Casa 2 SL	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
816cdaa3-192f-471a-8ba1-d519fb928359	Curral MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
cd00dca3-f8fb-4313-8a3e-efa624d2475a	Estrada 62	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
eac8ac0f-fcf7-4ee5-a108-2e43e2188736	Eucalipto 144	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
f18f99e5-dba6-41e7-8522-cc5eb0e19ee4	Eucalipto 62	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
ed39e919-dcd9-4d3f-956f-7906b7930c01	Eucalipto MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
49d49fac-4945-4c37-ab3f-d579318c9adb	Pimenta 2 SL	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
d4a9eed1-6a11-42ce-bccf-8d12eab31a04	Pimenta Arara	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
8c6c2923-2ee3-4663-a547-a281e0d928ac	Pimenta MN	096da0b8-b4cf-4dd4-96df-782c9febb2f1	t
\.


--
-- TOC entry 4989 (class 0 OID 16901)
-- Dependencies: 223
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 4986 (class 0 OID 16863)
-- Dependencies: 220
-- Data for Name: realizado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realizado (id, safra, lavoura, servico, data, status, produto, unidade, quantidade, usuario_id, cliente_id, criado_em) FROM stdin;
b7b7483d-9cbb-486d-8955-41468f72912f	Safra 25/26	Canjica Arara	1 adubação química	2025-10-07	realizado	21-00-21 (na)	Kg	20000.00	539bca26-5145-43cb-a02b-613f2ca7cbb1	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-02 14:04:43.233271
cce44291-5d61-4f2d-adce-342b2499ab7d	Safra 25/26	Canjica Arara	2 adubação química	2025-12-01	realizado	21-00-21 (na)	Kg	10000.00	539bca26-5145-43cb-a02b-613f2ca7cbb1	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-02 14:28:30.844176
d83edc5c-22b6-4a92-a3d6-8dd304bc6c1b	Safra 25/26	Eucalipto 144	1 amostra de folhas	2025-11-30	realizado	\N	\N	\N	539bca26-5145-43cb-a02b-613f2ca7cbb1	096da0b8-b4cf-4dd4-96df-782c9febb2f1	2025-12-02 15:40:27.363084
\.


--
-- TOC entry 4988 (class 0 OID 16890)
-- Dependencies: 222
-- Data for Name: safras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.safras (id, nome, ativo) FROM stdin;
24c70e2c-298d-4d20-8601-205768633741	Safra 25/26	t
1cf6f2bb-f8a2-4c6b-9da3-1f0143c3c90e	Safra 26/27	t
\.


--
-- TOC entry 4987 (class 0 OID 16882)
-- Dependencies: 221
-- Data for Name: servicos_lista; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 4985 (class 0 OID 16848)
-- Dependencies: 219
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, usuario, email, senha, cliente_id) FROM stdin;
d767fa9a-9093-422c-a678-c33e0c6308eb	Carol	contato@agrocoffe.com.br	$2b$10$qRjrCnKTGgYWxukjFZOb9.CQWd47UumDg4XoEnPTRyG0nXzDrD1Uu	096da0b8-b4cf-4dd4-96df-782c9febb2f1
539bca26-5145-43cb-a02b-613f2ca7cbb1	Daniel Veiga	dvs.veiga78@gmail.com	$2b$10$dFL4dnCy6tfbUJ0wTpoXi.DT00GixqoMh3L26svVq/D5Q1pJ.iQD6	096da0b8-b4cf-4dd4-96df-782c9febb2f1
\.


--
-- TOC entry 4814 (class 2606 OID 16834)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 16938)
-- Name: lavouras lavouras_cliente_id_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lavouras
    ADD CONSTRAINT lavouras_cliente_id_nome_key UNIQUE (cliente_id, nome);


--
-- TOC entry 4834 (class 2606 OID 16936)
-- Name: lavouras lavouras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lavouras
    ADD CONSTRAINT lavouras_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 16911)
-- Name: produtos produtos_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_nome_key UNIQUE (nome);


--
-- TOC entry 4830 (class 2606 OID 16909)
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 16900)
-- Name: safras safras_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.safras
    ADD CONSTRAINT safras_nome_key UNIQUE (nome);


--
-- TOC entry 4826 (class 2606 OID 16898)
-- Name: safras safras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.safras
    ADD CONSTRAINT safras_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 2606 OID 16889)
-- Name: servicos_lista servicos_lista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicos_lista
    ADD CONSTRAINT servicos_lista_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16871)
-- Name: realizado servicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT servicos_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 16857)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4818 (class 2606 OID 16855)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 16939)
-- Name: lavouras lavouras_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lavouras
    ADD CONSTRAINT lavouras_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 16877)
-- Name: realizado servicos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT servicos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- TOC entry 4837 (class 2606 OID 16872)
-- Name: realizado servicos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realizado
    ADD CONSTRAINT servicos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4835 (class 2606 OID 16858)
-- Name: usuarios usuarios_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


-- Completed on 2025-12-02 17:43:40

--
-- PostgreSQL database dump complete
--

\unrestrict 5ewKgEVQH5aLZ6gYpMgdpMyfekw0qPmuV1kiql3VNseeIKV0YhK4xuxO9TDKWPk

