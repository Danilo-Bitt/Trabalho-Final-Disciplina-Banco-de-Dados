-- MySQL Script para Pilhadão Açaí
-- Base de dados para Trabalho da Disciplina de Banco de Dados

CREATE SCHEMA IF NOT EXISTS `db_trabalho` DEFAULT CHARACTER SET utf8mb4;
USE `db_trabalho`;

-- -----------------------------------------------------
-- Table `categoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categoria` (
  `idcategoria` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) NOT NULL,
  `descricao` VARCHAR(200) NULL,
  PRIMARY KEY (`idcategoria`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `produto` (
  `idproduto` INT NOT NULL AUTO_INCREMENT,
  `categoria_idcategoria` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `quantidade_estoque` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `unidade_medida` VARCHAR(15) NOT NULL,
  `estoque_minimo` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `preco_custo` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `data_validade` DATE NULL,
  PRIMARY KEY (`idproduto`),
  INDEX `fk_produto_categoria_idx` (`categoria_idcategoria` ASC) VISIBLE,
  CONSTRAINT `fk_produto_categoria`
    FOREIGN KEY (`categoria_idcategoria`)
    REFERENCES `categoria` (`idcategoria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `endereco`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `endereco` (
  `idendereco` INT NOT NULL AUTO_INCREMENT,
  `cidade` VARCHAR(45) NOT NULL,
  `uf` VARCHAR(2) NOT NULL,
  `pais` VARCHAR(45) NOT NULL DEFAULT 'Brasil',
  `cep` VARCHAR(9) NOT NULL,
  `logradouro` VARCHAR(100) NOT NULL,
  `numero` VARCHAR(10) NOT NULL,
  `bairro` VARCHAR(45) NOT NULL,
  `complemento` VARCHAR(45) NULL,
  PRIMARY KEY (`idendereco`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `fornecedor`
-- -----------------------------------------------------
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
    REFERENCES `endereco` (`idendereco`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario` (
  `idusuario` INT NOT NULL AUTO_INCREMENT,
  `nome_usuario` VARCHAR(45) NOT NULL,
  `cargo` VARCHAR(45) NOT NULL,
  `login` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idusuario`),
  UNIQUE INDEX `login_UNIQUE` (`login` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `movimentacao`
-- -----------------------------------------------------
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
    REFERENCES `produto` (`idproduto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_movimentacao_usuario1`
    FOREIGN KEY (`usuario_idusuario`)
    REFERENCES `usuario` (`idusuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `produto_fornecedor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `produto_fornecedor` (
  `produto_idproduto` INT NOT NULL,
  `fornecedor_idfornecedor` INT NOT NULL,
  `preco_fornecedor` DECIMAL(10,2) NOT NULL,
  `codigo_sku_fornecedor` VARCHAR(30) NOT NULL,
  `prazo_entrega_dias` INT NOT NULL,
  PRIMARY KEY (`produto_idproduto`, `fornecedor_idfornecedor`),
  INDEX `fk_produto_has_fornecedor_fornecedor1_idx` (`fornecedor_idfornecedor` ASC) VISIBLE,
  INDEX `fk_produto_has_fornecedor_produto1_idx` (`produto_idproduto` ASC) VISIBLE,
  CONSTRAINT `fk_produto_has_fornecedor_produto1`
    FOREIGN KEY (`produto_idproduto`)
    REFERENCES `produto` (`idproduto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_produto_has_fornecedor_fornecedor1`
    FOREIGN KEY (`fornecedor_idfornecedor`)
    REFERENCES `fornecedor` (`idfornecedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
