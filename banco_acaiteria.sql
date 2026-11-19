-- -----------------------------------------------------
-- PARTE 1: CRIAÇÃO DO BANCO DE DADOS E TABELAS
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `db_trabalho`;
CREATE SCHEMA IF NOT EXISTS `db_trabalho` DEFAULT CHARACTER SET utf8mb4;
USE `db_trabalho`;

CREATE TABLE IF NOT EXISTS `categoria` (
  `idcategoria` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) NOT NULL,
  `descricao` VARCHAR(200) NULL,
  PRIMARY KEY (`idcategoria`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `produto` (
  `idproduto` INT NOT NULL AUTO_INCREMENT,
  `categoria_idcategoria` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `quantidadeEstoque` DECIMAL(10,2) NOT NULL,
  `unidade_medida` VARCHAR(15) NOT NULL,
  `estoque_minimo` DECIMAL(10,2) NOT NULL,
  `preco_custo` DECIMAL(10,2) NOT NULL,
  `data_validade` DATE NULL,
  PRIMARY KEY (`idproduto`),
  INDEX `fk_produto_categoria_idx` (`categoria_idcategoria` ASC) VISIBLE,
  CONSTRAINT `fk_produto_categoria`
    FOREIGN KEY (`categoria_idcategoria`)
    REFERENCES `categoria` (`idcategoria`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `endereco` (
  `idendereco` INT NOT NULL AUTO_INCREMENT,
  `cidade` VARCHAR(45) NOT NULL,
  `uf` VARCHAR(2) NOT NULL,
  `pais` VARCHAR(45) NOT NULL,
  `cep` VARCHAR(9) NOT NULL,
  `logradouro` VARCHAR(100) NOT NULL,
  `numero` VARCHAR(10) NOT NULL,
  `bairro` VARCHAR(45) NOT NULL,
  `complemento` VARCHAR(45) NULL,
  PRIMARY KEY (`idendereco`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `fornecedor` (
  `idfornecedor` INT NOT NULL AUTO_INCREMENT,
  `endereco_idendereco` INT NOT NULL,
  `nome` VARCHAR(45) NOT NULL,
  `cnpj` VARCHAR(18) NOT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `nome_contato` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`idfornecedor`),
  UNIQUE INDEX `cnpj_UNIQUE` (`cnpj` ASC) VISIBLE,
  INDEX `fk_fornecedor_endereco1_idx` (`endereco_idendereco` ASC) VISIBLE,
  CONSTRAINT `fk_fornecedor_endereco1`
    FOREIGN KEY (`endereco_idendereco`)
    REFERENCES `endereco` (`idendereco`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `usuario` (
  `idusuario` INT NOT NULL AUTO_INCREMENT,
  `nome_usuario` VARCHAR(45) NOT NULL,
  `cargo` VARCHAR(45) NOT NULL,
  `login` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idusuario`),
  UNIQUE INDEX `login_UNIQUE` (`login` ASC) VISIBLE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `movimentacao` (
  `idmovimentacao` INT NOT NULL AUTO_INCREMENT,
  `produto_idproduto` INT NOT NULL,
  `usuario_idusuario` INT NOT NULL,
  `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
  `quantidade` DECIMAL(10,2) NOT NULL,
  `data_hora` DATETIME NOT NULL,
  `descricao` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`idmovimentacao`),
  INDEX `fk_movimentacao_produto1_idx` (`produto_idproduto` ASC) VISIBLE,
  INDEX `fk_movimentacao_usuario1_idx` (`usuario_idusuario` ASC) VISIBLE,
  CONSTRAINT `fk_movimentacao_produto1`
    FOREIGN KEY (`produto_idproduto`)
    REFERENCES `produto` (`idproduto`),
  CONSTRAINT `fk_movimentacao_usuario1`
    FOREIGN KEY (`usuario_idusuario`)
    REFERENCES `usuario` (`idusuario`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `produto_fornecedor` (
  `produto_idproduto` INT NOT NULL,
  `fornecedor_idfornecedor` INT NOT NULL,
  `preco_fornecedor` DECIMAL(10,2) NOT NULL,
  `codigo_sku_furnecedor` VARCHAR(30) NOT NULL,
  `prazo_entrega_dias` INT NOT NULL,
  PRIMARY KEY (`produto_idproduto`, `fornecedor_idfornecedor`),
  INDEX `fk_produto_has_fornecedor_fornecedor1_idx` (`fornecedor_idfornecedor` ASC) VISIBLE,
  INDEX `fk_produto_has_fornecedor_produto1_idx` (`produto_idproduto` ASC) VISIBLE,
  CONSTRAINT `fk_produto_has_fornecedor_produto1`
    FOREIGN KEY (`produto_idproduto`)
    REFERENCES `produto` (`idproduto`),
  CONSTRAINT `fk_produto_has_fornecedor_fornecedor1`
    FOREIGN KEY (`fornecedor_idfornecedor`)
    REFERENCES `fornecedor` (`idfornecedor`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- PARTE 2: INSERÇÃO DA BASE DA AÇAITERIA
-- -----------------------------------------------------
-- 1. CATEGORIAS DA AÇAITERIA
INSERT INTO `categoria` (`nome`, `descricao`) VALUES
('Açaí Tradicional', 'Caixas de açaí puro e batido'),
('Cremes e Sorvetes', 'Creme de cupuaçu, pitaya, tapioca e sorvetes variados'),
('Complementos Secos', 'Granola, amendoim, paçoca, leite em pó, chocoball'),
('Complementos Doces', 'Leite condensado, Nutella, cremes de avelã, caldas'),
('Frutas Frescas', 'Morango, banana, kiwi, manga, uva'),
('Embalagens e Descartáveis', 'Copos, potes, tampas, colheres, sacolas kraft');

-- 2. ENDEREÇOS (Da loja, dos funcionários e fornecedores)
INSERT INTO `endereco` (`cidade`, `uf`, `pais`, `cep`, `logradouro`, `numero`, `bairro`, `complemento`) VALUES
('São Paulo', 'SP', 'Brasil', '01001-000', 'Rua das Frutas', '100', 'Centro', 'Galpão 1'),
('Campinas', 'SP', 'Brasil', '13010-111', 'Av. das Embalagens', '250', 'Distrito Industrial', 'Lote 4'),
('Belém', 'PA', 'Brasil', '66010-000', 'Rodovia do Açaí', '1500', 'Umarizal', 'Matriz Norte'),
('São Paulo', 'SP', 'Brasil', '02002-000', 'Rua dos Doces', '45', 'Mooca', 'Loja 2'),
('Belo Horizonte', 'MG', 'Brasil', '30120-010', 'Av. do Leite', '900', 'Savassi', 'Sala 3');

-- 3. USUÁRIOS (A equipe da sua Açaiteria)
INSERT INTO `usuario` (`nome_usuario`, `cargo`, `login`, `senha`) VALUES
('Carlos Silva', 'Gerente', 'carlos.gerente', 'acai123'),
('Ana Souza', 'Atendente Balcão', 'ana.atend', 'acai123'),
('Marcos Paulo', 'Estoquista', 'marcos.estoque', 'acai123');

-- 4. FORNECEDORES ESPECÍFICOS DO RAMO
INSERT INTO `fornecedor` (`endereco_idendereco`, `nome`, `cnpj`, `telefone`, `email`, `nome_contato`) VALUES
(3, 'Açaí Raiz da Amazônia', '11.111.111/0001-11', '(91) 9999-1111', 'vendas@acairaiz.com', 'Roberto'),
(1, 'Hortifruti Frescor', '22.222.222/0001-22', '(11) 9888-2222', 'contato@hortifrutifrescor.com', 'Fernanda'),
(4, 'Doce Mania Atacadista (Nutella e Caldas)', '33.333.333/0001-33', '(11) 9777-3333', 'pedidos@docemania.com', 'Julio'),
(5, 'Laticínios Minas (Leite em pó e Condensado)', '44.444.444/0001-44', '(31) 9666-4444', 'comercial@laticinios.com', 'Mariana'),
(2, 'Embalagens Práticas Potes e Copos', '55.555.555/0001-55', '(19) 9555-5555', 'vendas@embalagens.com', 'Pedro');


-- -----------------------------------------------------
-- PARTE 3: INSERÇÃO DOS 100 PRODUTOS E VÍNCULOS
-- -----------------------------------------------------
-- 1. INSERINDO 100 PRODUTOS DE AÇAITERIA
INSERT INTO `produto` (`categoria_idcategoria`, `nome`, `quantidadeEstoque`, `unidade_medida`, `estoque_minimo`, `preco_custo`, `data_validade`) VALUES
(1, 'Caixa de Açaí Tradicional 10L', 30.00, 'Caixa', 5.00, 95.00, '2027-05-10'),
(1, 'Caixa de Açaí Tradicional 5L', 15.00, 'Caixa', 3.00, 55.00, '2027-05-10'),
(1, 'Caixa de Açaí Zero Açúcar 10L', 10.00, 'Caixa', 2.00, 115.00, '2027-06-15'),
(1, 'Caixa de Açaí Zero Açúcar 5L', 5.00, 'Caixa', 2.00, 65.00, '2027-06-15'),
(1, 'Caixa de Açaí com Guaraná 10L', 40.00, 'Caixa', 10.00, 90.00, '2027-08-20'),
(1, 'Caixa de Açaí com Guaraná 5L', 20.00, 'Caixa', 5.00, 50.00, '2027-08-20'),
(1, 'Caixa de Açaí com Banana 10L', 15.00, 'Caixa', 3.00, 98.00, '2027-04-12'),
(1, 'Caixa de Açaí com Morango 10L', 12.00, 'Caixa', 3.00, 105.00, '2027-04-12'),
(1, 'Caixa de Açaí Puro (Sem Xarope) 10L', 8.00, 'Caixa', 2.00, 120.00, '2027-02-28'),
(1, 'Caixa de Açaí Orgânico 10L', 6.00, 'Caixa', 2.00, 140.00, '2027-03-10'),
(1, 'Caixa de Açaí Trufado 10L', 10.00, 'Caixa', 2.00, 130.00, '2027-05-22'),
(1, 'Caixa de Açaí Extra Cremoso 10L', 25.00, 'Caixa', 5.00, 110.00, '2027-06-30'),
(1, 'Caixa de Açaí Kids (Mais Doce) 5L', 8.00, 'Caixa', 2.00, 60.00, '2027-07-15'),
(1, 'Caixa de Açaí Premium 10L', 12.00, 'Caixa', 3.00, 150.00, '2027-09-01'),
(1, 'Caixa de Açaí Diet 10L', 5.00, 'Caixa', 2.00, 125.00, '2027-03-20'),
(2, 'Creme de Tapioca 10L', 10.00, 'Caixa', 2.00, 110.00, '2027-04-10'),
(2, 'Creme de Cupuaçu 10L', 15.00, 'Caixa', 3.00, 115.00, '2027-05-15'),
(2, 'Creme de Leite Ninho 10L', 20.00, 'Caixa', 5.00, 125.00, '2027-06-20'),
(2, 'Creme de Morango 10L', 12.00, 'Caixa', 3.00, 105.00, '2027-04-05'),
(2, 'Creme de Maracujá 10L', 8.00, 'Caixa', 2.00, 110.00, '2027-03-30'),
(2, 'Creme de Graviola 10L', 6.00, 'Caixa', 2.00, 120.00, '2027-02-15'),
(2, 'Creme de Pitaya 10L', 14.00, 'Caixa', 3.00, 130.00, '2027-07-10'),
(2, 'Creme Energético (Tutti-Frutti) 10L', 10.00, 'Caixa', 2.00, 95.00, '2027-08-25'),
(2, 'Creme de Amendoim 10L', 7.00, 'Caixa', 2.00, 115.00, '2027-05-05'),
(2, 'Creme de Paçoca 10L', 18.00, 'Caixa', 4.00, 120.00, '2027-06-12'),
(2, 'Creme de Avelã 10L', 10.00, 'Caixa', 2.00, 140.00, '2027-04-22'),
(2, 'Creme de Leite Condensado 10L', 15.00, 'Caixa', 3.00, 118.00, '2027-05-30'),
(2, 'Creme de Ovomaltine 10L', 12.00, 'Caixa', 3.00, 135.00, '2027-07-18'),
(2, 'Sorvete Blue Ice 10L', 5.00, 'Caixa', 2.00, 90.00, '2027-08-01'),
(2, 'Sorvete de Chiclete 10L', 4.00, 'Caixa', 2.00, 90.00, '2027-08-01'),
(2, 'Sorvete de Uva 10L', 6.00, 'Caixa', 2.00, 85.00, '2027-03-15'),
(2, 'Sorvete de Abacaxi 10L', 7.00, 'Caixa', 2.00, 85.00, '2027-03-15'),
(2, 'Sorvete Laka 10L', 10.00, 'Caixa', 2.00, 145.00, '2027-06-25'),
(2, 'Sorvete Sonho de Valsa 10L', 12.00, 'Caixa', 3.00, 145.00, '2027-06-25'),
(2, 'Sorvete Ouro Branco 10L', 10.00, 'Caixa', 2.00, 145.00, '2027-06-25'),
(3, 'Granola Tradicional', 30.00, 'Kg', 5.00, 12.50, '2027-10-10'),
(3, 'Granola com Banana', 15.00, 'Kg', 3.00, 14.00, '2027-10-10'),
(3, 'Granola com Cacau', 20.00, 'Kg', 4.00, 15.50, '2027-10-10'),
(3, 'Granola Sem Açúcar', 10.00, 'Kg', 2.00, 18.00, '2027-11-15'),
(3, 'Amendoim Granulado', 25.00, 'Kg', 5.00, 11.00, '2027-08-20'),
(3, 'Amendoim Moído', 20.00, 'Kg', 4.00, 11.50, '2027-08-20'),
(3, 'Paçoca Rolha', 40.00, 'Caixa', 5.00, 25.00, '2027-09-05'),
(3, 'Leite Ninho em Pó', 35.00, 'Kg', 10.00, 32.00, '2027-12-01'),
(3, 'Leite em Pó Itambé', 20.00, 'Kg', 5.00, 28.00, '2027-12-01'),
(3, 'Chocoball Preto e Branco', 15.00, 'Kg', 3.00, 18.50, '2027-07-25'),
(3, 'Sucrilhos Tradicional', 12.00, 'Kg', 3.00, 22.00, '2027-08-30'),
(3, 'Aveia em Flocos', 18.00, 'Kg', 4.00, 9.50, '2027-11-22'),
(3, 'Confete (MMs Genérico)', 25.00, 'Kg', 5.00, 20.00, '2027-06-15'),
(3, 'Granulado de Chocolate', 20.00, 'Kg', 4.00, 14.00, '2027-09-10'),
(3, 'Granulado Colorido', 15.00, 'Kg', 3.00, 14.50, '2027-09-10'),
(3, 'Flocos de Arroz', 10.00, 'Kg', 2.00, 11.00, '2027-05-20'),
(3, 'Gotas de Chocolate Ao Leite', 12.00, 'Kg', 3.00, 28.00, '2027-04-18'),
(3, 'Gotas de Chocolate Branco', 10.00, 'Kg', 2.00, 29.00, '2027-04-18'),
(3, 'Jujuba Colorida', 15.00, 'Kg', 3.00, 13.00, '2027-10-30'),
(3, 'Marshmallow', 8.00, 'Pacote', 2.00, 16.50, '2027-11-05'),
(3, 'Castanha de Caju Moída', 10.00, 'Kg', 2.00, 65.00, '2027-03-25'),
(3, 'Castanha do Pará Picada', 8.00, 'Kg', 2.00, 75.00, '2027-03-25'),
(3, 'Nozes Picadas', 5.00, 'Kg', 1.00, 95.00, '2027-02-15'),
(3, 'Coco Ralado Úmido', 15.00, 'Kg', 3.00, 22.00, '2027-08-12'),
(3, 'Semente de Chia', 6.00, 'Kg', 1.00, 35.00, '2027-12-10'),
(4, 'Leite Condensado Moça', 60.00, 'Lata', 15.00, 6.50, '2027-12-15'),
(4, 'Leite Condensado Italac', 45.00, 'Caixa', 10.00, 4.80, '2027-11-20'),
(4, 'Nutella Balde 3kg', 12.00, 'Balde', 3.00, 145.00, '2027-09-01'),
(4, 'Nutella Pote 650g', 20.00, 'Pote', 5.00, 42.00, '2027-09-01'),
(4, 'Creme de Avelã Genérico 3kg', 15.00, 'Balde', 3.00, 85.00, '2027-08-15'),
(4, 'Calda de Morango 1L', 10.00, 'Frasco', 2.00, 14.00, '2027-10-10'),
(4, 'Calda de Chocolate 1L', 15.00, 'Frasco', 3.00, 14.00, '2027-10-10'),
(4, 'Calda de Caramelo 1L', 10.00, 'Frasco', 2.00, 14.00, '2027-10-10'),
(4, 'Calda de Kiwi 1L', 5.00, 'Frasco', 1.00, 16.00, '2027-09-05'),
(4, 'Calda de Frutas Vermelhas 1L', 8.00, 'Frasco', 2.00, 18.00, '2027-09-05'),
(4, 'Doce de Leite Pastoso', 25.00, 'Pote', 5.00, 22.00, '2027-06-22'),
(4, 'Mel de Abelha Puro', 12.00, 'Frasco', 3.00, 35.00, '2028-12-31'),
(4, 'Xarope de Guaraná Puro', 10.00, 'Litro', 2.00, 25.00, '2027-11-11'),
(4, 'Leite de Coco', 20.00, 'Frasco', 5.00, 8.50, '2027-08-30'),
(4, 'Creme de Leite', 35.00, 'Caixa', 10.00, 3.50, '2027-07-15'),
(5, 'Morango Fresco', 45.00, 'Bandeja', 10.00, 6.00, '2026-11-25'),
(5, 'Banana Prata', 30.00, 'Kg', 10.00, 4.50, '2026-11-22'),
(5, 'Banana Nanica', 25.00, 'Kg', 8.00, 3.80, '2026-11-21'),
(5, 'Kiwi Fresco', 15.00, 'Kg', 4.00, 18.00, '2026-11-28'),
(5, 'Manga Palmer', 12.00, 'Kg', 3.00, 7.50, '2026-11-24'),
(5, 'Uva Thompson (Sem semente)', 20.00, 'Bandeja', 5.00, 12.00, '2026-11-26'),
(5, 'Uva Verde Fresca', 15.00, 'Bandeja', 4.00, 10.00, '2026-11-26'),
(5, 'Abacaxi Pérola', 18.00, 'Unidade', 5.00, 5.00, '2026-11-29'),
(5, 'Maçã Gala', 10.00, 'Kg', 3.00, 9.00, '2026-12-05'),
(5, 'Mamão Papaya', 12.00, 'Unidade', 3.00, 6.50, '2026-11-23'),
(6, 'Copo Plástico Transparente 300ml', 50.00, 'Caixa', 10.00, 85.00, NULL),
(6, 'Copo Plástico Transparente 500ml', 80.00, 'Caixa', 15.00, 95.00, NULL),
(6, 'Copo Plástico Transparente 700ml', 40.00, 'Caixa', 10.00, 110.00, NULL),
(6, 'Tampa Bolha Furo Maior 300/500', 60.00, 'Caixa', 10.00, 120.00, NULL),
(6, 'Tampa Reta Fechada 300/500', 40.00, 'Caixa', 10.00, 90.00, NULL),
(6, 'Pote Térmico Isopor 300ml', 30.00, 'Caixa', 5.00, 65.00, NULL),
(6, 'Pote Térmico Isopor 500ml', 45.00, 'Caixa', 8.00, 75.00, NULL),
(6, 'Tampa para Pote Isopor', 70.00, 'Caixa', 10.00, 55.00, NULL),
(6, 'Colher Plástica Roxa (Sobremesa)', 100.00, 'Caixa', 20.00, 45.00, NULL),
(6, 'Colher Plástica Branca Reforçada', 80.00, 'Caixa', 15.00, 50.00, NULL),
(6, 'Guardanapo de Papel', 120.00, 'Pacote', 20.00, 18.00, NULL),
(6, 'Sacola Kraft Delivery Pequena', 35.00, 'Caixa', 5.00, 130.00, NULL),
(6, 'Sacola Kraft Delivery Média', 40.00, 'Caixa', 5.00, 150.00, NULL),
(6, 'Sacola Plástica Branca Alça', 90.00, 'Milheiro', 15.00, 45.00, NULL),
(6, 'Bobina Picotada para Frutas', 15.00, 'Rolo', 3.00, 35.00, NULL);

-- 2. VINCULANDO OS 100 PRODUTOS AOS FORNECEDORES
INSERT INTO `produto_fornecedor` (`produto_idproduto`, `fornecedor_idfornecedor`, `preco_fornecedor`, `codigo_sku_furnecedor`, `prazo_entrega_dias`) VALUES
(1, 1, 95.00, 'ACAI-001', 5), (2, 1, 55.00, 'ACAI-002', 5), (3, 1, 115.00, 'ACAI-003', 5), (4, 1, 65.00, 'ACAI-004', 5), (5, 1, 90.00, 'ACAI-005', 5),
(6, 1, 50.00, 'ACAI-006', 5), (7, 1, 98.00, 'ACAI-007', 5), (8, 1, 105.00, 'ACAI-008', 5), (9, 1, 120.00, 'ACAI-009', 5), (10, 1, 140.00, 'ACAI-010', 5),
(11, 1, 130.00, 'ACAI-011', 5), (12, 1, 110.00, 'ACAI-012', 5), (13, 1, 60.00, 'ACAI-013', 5), (14, 1, 150.00, 'ACAI-014', 5), (15, 1, 125.00, 'ACAI-015', 5),
(16, 1, 110.00, 'CREM-016', 7), (17, 1, 115.00, 'CREM-017', 7), (18, 1, 125.00, 'CREM-018', 7), (19, 1, 105.00, 'CREM-019', 7), (20, 1, 110.00, 'CREM-020', 7),
(21, 1, 120.00, 'CREM-021', 7), (22, 1, 130.00, 'CREM-022', 7), (23, 1, 95.00, 'CREM-023', 7), (24, 1, 115.00, 'CREM-024', 7), (25, 1, 120.00, 'CREM-025', 7),
(26, 1, 140.00, 'CREM-026', 7), (27, 1, 118.00, 'CREM-027', 7), (28, 1, 135.00, 'CREM-028', 7), (29, 1, 90.00, 'CREM-029', 7), (30, 1, 90.00, 'CREM-030', 7),
(31, 1, 85.00, 'CREM-031', 7), (32, 1, 85.00, 'CREM-032', 7), (33, 1, 145.00, 'CREM-033', 7), (34, 1, 145.00, 'CREM-034', 7), (35, 1, 145.00, 'CREM-035', 7),
(36, 3, 12.50, 'SEC-036', 3), (37, 3, 14.00, 'SEC-037', 3), (38, 3, 15.50, 'SEC-038', 3), (39, 3, 18.00, 'SEC-039', 3), (40, 3, 11.00, 'SEC-040', 3),
(41, 3, 11.50, 'SEC-041', 3), (42, 3, 25.00, 'SEC-042', 3), (43, 3, 32.00, 'SEC-043', 3), (44, 3, 28.00, 'SEC-044', 3), (45, 3, 18.50, 'SEC-045', 3),
(46, 3, 22.00, 'SEC-046', 3), (47, 3, 9.50, 'SEC-047', 3), (48, 3, 20.00, 'SEC-048', 3), (49, 3, 14.00, 'SEC-049', 3), (50, 3, 14.50, 'SEC-050', 3),
(51, 3, 11.00, 'SEC-051', 3), (52, 3, 28.00, 'SEC-052', 3), (53, 3, 29.00, 'SEC-053', 3), (54, 3, 13.00, 'SEC-054', 3), (55, 3, 16.50, 'SEC-055', 3),
(56, 3, 65.00, 'SEC-056', 3), (57, 3, 75.00, 'SEC-057', 3), (58, 3, 95.00, 'SEC-058', 3), (59, 3, 22.00, 'SEC-059', 3), (60, 3, 35.00, 'SEC-060', 3),
(61, 4, 6.50, 'DOC-061', 4), (62, 4, 4.80, 'DOC-062', 4), (63, 3, 145.00, 'DOC-063', 3), (64, 3, 42.00, 'DOC-064', 3), (65, 3, 85.00, 'DOC-065', 3),
(66, 3, 14.00, 'DOC-066', 3), (67, 3, 14.00, 'DOC-067', 3), (68, 3, 14.00, 'DOC-068', 3), (69, 3, 16.00, 'DOC-069', 3), (70, 3, 18.00, 'DOC-070', 3),
(71, 4, 22.00, 'DOC-071', 4), (72, 3, 35.00, 'DOC-072', 3), (73, 3, 25.00, 'DOC-073', 3), (74, 4, 8.50, 'DOC-074', 4), (75, 4, 3.50, 'DOC-075', 4),
(76, 2, 6.00, 'FRU-076', 1), (77, 2, 4.50, 'FRU-077', 1), (78, 2, 3.80, 'FRU-078', 1), (79, 2, 18.00, 'FRU-079', 1), (80, 2, 7.50, 'FRU-080', 1),
(81, 2, 12.00, 'FRU-081', 1), (82, 2, 10.00, 'FRU-082', 1), (83, 2, 5.00, 'FRU-083', 1), (84, 2, 9.00, 'FRU-084', 1), (85, 2, 6.50, 'FRU-085', 1),
(86, 5, 85.00, 'EMB-086', 5), (87, 5, 95.00, 'EMB-087', 5), (88, 5, 110.00, 'EMB-088', 5), (89, 5, 120.00, 'EMB-089', 5), (90, 5, 90.00, 'EMB-090', 5),
(91, 5, 65.00, 'EMB-091', 5), (92, 5, 75.00, 'EMB-092', 5), (93, 5, 55.00, 'EMB-093', 5), (94, 5, 45.00, 'EMB-094', 5), (95, 5, 50.00, 'EMB-095', 5),
(96, 5, 18.00, 'EMB-096', 5), (97, 5, 130.00, 'EMB-097', 5), (98, 5, 150.00, 'EMB-098', 5), (99, 5, 45.00, 'EMB-099', 5), (100, 5, 35.00, 'EMB-100', 5);

-- 3. INSERINDO AS 10 PRIMEIRAS MOVIMENTAÇÕES DE ESTOQUE
INSERT INTO `movimentacao` (`produto_idproduto`, `usuario_idusuario`, `tipo`, `quantidade`, `data_hora`, `descricao`) VALUES
(1, 3, 'ENTRADA', 10.00, '2023-11-01 08:00:00', 'Recebimento de Açaí Tradicional'),
(76, 2, 'ENTRADA', 20.00, '2023-11-01 08:30:00', 'Chegada de Morangos frescos'),
(63, 1, 'ENTRADA', 5.00, '2023-11-02 09:00:00', 'Compra de Baldes Nutella'),
(1, 2, 'SAIDA', 1.00, '2023-11-02 14:30:00', 'Uso no balcão - Pedido 100'),
(76, 2, 'SAIDA', 2.00, '2023-11-02 15:00:00', 'Uso no balcão - Frutas da tarde'),
(87, 3, 'ENTRADA', 10.00, '2023-11-03 10:15:00', 'Reposição de Copos 500ml'),
(36, 1, 'ENTRADA', 15.00, '2023-11-03 11:00:00', 'Estoque de Granola Tradicional'),
(63, 2, 'SAIDA', 0.50, '2023-11-03 18:20:00', 'Consumo do balde Nutella balcão'),
(77, 2, 'ENTRADA', 30.00, '2023-11-04 07:45:00', 'Carga de Banana Prata'),
(16, 3, 'ENTRADA', 5.00, '2023-11-04 09:10:00', 'Recebimento Creme Tapioca');


-- -----------------------------------------------------
-- PARTE 4: INSERÇÃO DAS 90 MOVIMENTAÇÕES EXTRAS (TOTALIZANDO 100)
-- -----------------------------------------------------
INSERT INTO `movimentacao` (`produto_idproduto`, `usuario_idusuario`, `tipo`, `quantidade`, `data_hora`, `descricao`) VALUES
(2, 2, 'SAIDA', 1.00, '2023-11-05 10:00:00', 'Venda balcão - Pedido 101'),
(3, 2, 'SAIDA', 2.00, '2023-11-05 10:15:00', 'Venda balcão - Pedido 102'),
(4, 2, 'SAIDA', 1.00, '2023-11-05 10:30:00', 'Venda balcão - Pedido 103'),
(5, 2, 'SAIDA', 3.00, '2023-11-05 11:00:00', 'Venda delivery - Ifood 550'),
(6, 2, 'SAIDA', 1.00, '2023-11-05 11:20:00', 'Venda delivery - Ifood 551'),
(37, 1, 'SAIDA', 0.50, '2023-11-05 12:00:00', 'Uso interno (Granola com banana)'),
(64, 1, 'SAIDA', 0.20, '2023-11-05 12:15:00', 'Uso interno (Nutella)'),
(78, 2, 'SAIDA', 1.00, '2023-11-05 13:00:00', 'Venda balcão - Pedido 104'),
(79, 2, 'SAIDA', 0.50, '2023-11-05 13:30:00', 'Venda balcão - Pedido 105'),
(88, 3, 'ENTRADA', 20.00, '2023-11-06 08:00:00', 'Reposição copos 700ml'),
(89, 3, 'ENTRADA', 15.00, '2023-11-06 08:30:00', 'Reposição tampas bolha'),
(7, 2, 'SAIDA', 2.00, '2023-11-06 14:00:00', 'Venda delivery - Ifood 552'),
(8, 2, 'SAIDA', 1.00, '2023-11-06 14:45:00', 'Venda balcão - Pedido 106'),
(38, 1, 'SAIDA', 0.30, '2023-11-06 15:00:00', 'Uso interno (Granola Cacau)'),
(65, 1, 'SAIDA', 0.50, '2023-11-06 15:30:00', 'Uso interno (Creme Avelã)'),
(9, 2, 'SAIDA', 1.00, '2023-11-07 10:00:00', 'Venda balcão - Pedido 107'),
(10, 2, 'SAIDA', 2.00, '2023-11-07 10:30:00', 'Venda balcão - Pedido 108'),
(40, 1, 'ENTRADA', 10.00, '2023-11-07 11:00:00', 'Chegada Amendoim Moido'),
(41, 1, 'ENTRADA', 5.00, '2023-11-07 11:30:00', 'Chegada Paçoca Rolha'),
(11, 2, 'SAIDA', 1.00, '2023-11-07 12:00:00', 'Venda delivery - Ifood 553'),
(12, 2, 'SAIDA', 3.00, '2023-11-07 12:45:00', 'Venda balcão - Pedido 109'),
(80, 2, 'SAIDA', 0.50, '2023-11-07 13:00:00', 'Uso interno (Manga Palmer)'),
(66, 1, 'SAIDA', 0.20, '2023-11-07 13:30:00', 'Uso interno (Calda Morango)'),
(13, 2, 'SAIDA', 1.00, '2023-11-08 14:00:00', 'Venda delivery - Ifood 554'),
(14, 2, 'SAIDA', 2.00, '2023-11-08 14:30:00', 'Venda balcão - Pedido 110'),
(43, 3, 'ENTRADA', 10.00, '2023-11-08 15:00:00', 'Reposição Leite em Pó'),
(44, 3, 'ENTRADA', 15.00, '2023-11-08 15:30:00', 'Reposição Chocoball'),
(15, 2, 'SAIDA', 1.00, '2023-11-08 16:00:00', 'Venda balcão - Pedido 111'),
(17, 2, 'SAIDA', 2.00, '2023-11-08 16:45:00', 'Venda delivery - Ifood 555'),
(81, 2, 'SAIDA', 0.50, '2023-11-08 17:00:00', 'Uso interno (Uva Thompson)'),
(67, 1, 'SAIDA', 0.30, '2023-11-08 17:30:00', 'Uso interno (Calda Chocolate)'),
(18, 2, 'SAIDA', 1.00, '2023-11-09 10:00:00', 'Venda balcão - Pedido 112'),
(19, 2, 'SAIDA', 3.00, '2023-11-09 10:30:00', 'Venda delivery - Ifood 556'),
(46, 1, 'ENTRADA', 5.00, '2023-11-09 11:00:00', 'Chegada Aveia em Flocos'),
(47, 1, 'ENTRADA', 10.00, '2023-11-09 11:30:00', 'Chegada Confete'),
(20, 2, 'SAIDA', 1.00, '2023-11-09 12:00:00', 'Venda balcão - Pedido 113'),
(21, 2, 'SAIDA', 2.00, '2023-11-09 12:45:00', 'Venda delivery - Ifood 557'),
(82, 2, 'SAIDA', 0.50, '2023-11-09 13:00:00', 'Uso interno (Uva Verde)'),
(68, 1, 'SAIDA', 0.20, '2023-11-09 13:30:00', 'Uso interno (Calda Caramelo)'),
(22, 2, 'SAIDA', 1.00, '2023-11-10 14:00:00', 'Venda balcão - Pedido 114'),
(23, 2, 'SAIDA', 3.00, '2023-11-10 14:30:00', 'Venda delivery - Ifood 558'),
(49, 3, 'ENTRADA', 15.00, '2023-11-10 15:00:00', 'Reposição Granulado Colorido'),
(50, 3, 'ENTRADA', 10.00, '2023-11-10 15:30:00', 'Reposição Flocos de Arroz'),
(24, 2, 'SAIDA', 1.00, '2023-11-10 16:00:00', 'Venda balcão - Pedido 115'),
(25, 2, 'SAIDA', 2.00, '2023-11-10 16:45:00', 'Venda delivery - Ifood 559'),
(83, 2, 'SAIDA', 1.00, '2023-11-10 17:00:00', 'Uso interno (Abacaxi)'),
(69, 1, 'SAIDA', 0.30, '2023-11-10 17:30:00', 'Uso interno (Calda Kiwi)'),
(26, 2, 'SAIDA', 1.00, '2023-11-11 10:00:00', 'Venda balcão - Pedido 116'),
(27, 2, 'SAIDA', 3.00, '2023-11-11 10:30:00', 'Venda delivery - Ifood 560'),
(52, 1, 'ENTRADA', 5.00, '2023-11-11 11:00:00', 'Chegada Gotas Chocolate Branco'),
(53, 1, 'ENTRADA', 10.00, '2023-11-11 11:30:00', 'Chegada Jujuba Colorida'),
(28, 2, 'SAIDA', 1.00, '2023-11-11 12:00:00', 'Venda balcão - Pedido 117'),
(29, 2, 'SAIDA', 2.00, '2023-11-11 12:45:00', 'Venda delivery - Ifood 561'),
(84, 2, 'SAIDA', 0.50, '2023-11-11 13:00:00', 'Uso interno (Maçã Gala)'),
(70, 1, 'SAIDA', 0.20, '2023-11-11 13:30:00', 'Uso interno (Calda Frutas Vermelhas)'),
(30, 2, 'SAIDA', 1.00, '2023-11-12 14:00:00', 'Venda balcão - Pedido 118'),
(31, 2, 'SAIDA', 3.00, '2023-11-12 14:30:00', 'Venda delivery - Ifood 562'),
(55, 3, 'ENTRADA', 10.00, '2023-11-12 15:00:00', 'Reposição Castanha Caju'),
(56, 3, 'ENTRADA', 5.00, '2023-11-12 15:30:00', 'Reposição Castanha Pará'),
(32, 2, 'SAIDA', 1.00, '2023-11-12 16:00:00', 'Venda balcão - Pedido 119'),
(33, 2, 'SAIDA', 2.00, '2023-11-12 16:45:00', 'Venda delivery - Ifood 563'),
(85, 2, 'SAIDA', 1.00, '2023-11-12 17:00:00', 'Uso interno (Mamão Papaya)'),
(71, 1, 'SAIDA', 0.50, '2023-11-12 17:30:00', 'Uso interno (Doce de Leite)'),
(34, 2, 'SAIDA', 1.00, '2023-11-13 10:00:00', 'Venda balcão - Pedido 120'),
(35, 2, 'SAIDA', 3.00, '2023-11-13 10:30:00', 'Venda delivery - Ifood 564'),
(58, 1, 'ENTRADA', 10.00, '2023-11-13 11:00:00', 'Chegada Coco Ralado'),
(59, 1, 'ENTRADA', 5.00, '2023-11-13 11:30:00', 'Chegada Semente Chia'),
(1, 2, 'SAIDA', 1.00, '2023-11-13 12:00:00', 'Venda balcão - Pedido 121'),
(2, 2, 'SAIDA', 2.00, '2023-11-13 12:45:00', 'Venda delivery - Ifood 565'),
(76, 2, 'SAIDA', 1.00, '2023-11-13 13:00:00', 'Uso interno (Morango)'),
(72, 1, 'SAIDA', 0.20, '2023-11-13 13:30:00', 'Uso interno (Mel de Abelha)'),
(3, 2, 'SAIDA', 1.00, '2023-11-14 14:00:00', 'Venda balcão - Pedido 122'),
(4, 2, 'SAIDA', 3.00, '2023-11-14 14:30:00', 'Venda delivery - Ifood 566'),
(86, 3, 'ENTRADA', 20.00, '2023-11-14 15:00:00', 'Reposição Copo 300ml'),
(87, 3, 'ENTRADA', 15.00, '2023-11-14 15:30:00', 'Reposição Copo 500ml'),
(5, 2, 'SAIDA', 1.00, '2023-11-14 16:00:00', 'Venda balcão - Pedido 123'),
(6, 2, 'SAIDA', 2.00, '2023-11-14 16:45:00', 'Venda delivery - Ifood 567'),
(77, 2, 'SAIDA', 1.00, '2023-11-14 17:00:00', 'Uso interno (Banana Prata)'),
(73, 1, 'SAIDA', 0.50, '2023-11-14 17:30:00', 'Uso interno (Xarope Guaraná)'),
(7, 2, 'SAIDA', 1.00, '2023-11-15 10:00:00', 'Venda balcão - Pedido 124'),
(8, 2, 'SAIDA', 3.00, '2023-11-15 10:30:00', 'Venda delivery - Ifood 568'),
(90, 1, 'ENTRADA', 10.00, '2023-11-15 11:00:00', 'Chegada Tampa Reta'),
(91, 1, 'ENTRADA', 5.00, '2023-11-15 11:30:00', 'Chegada Pote Isopor 300ml'),
(9, 2, 'SAIDA', 1.00, '2023-11-15 12:00:00', 'Venda balcão - Pedido 125'),
(10, 2, 'SAIDA', 2.00, '2023-11-15 12:45:00', 'Venda delivery - Ifood 569'),
(78, 2, 'SAIDA', 1.00, '2023-11-15 13:00:00', 'Uso interno (Banana Nanica)'),
(74, 1, 'SAIDA', 0.20, '2023-11-15 13:30:00', 'Uso interno (Leite de Coco)'),
(11, 2, 'SAIDA', 1.00, '2023-11-16 14:00:00', 'Venda balcão - Pedido 126'),
(12, 2, 'SAIDA', 3.00, '2023-11-16 14:30:00', 'Venda delivery - Ifood 570');
