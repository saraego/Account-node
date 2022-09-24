//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//modulos internos
const fs = require('fs')


console.log(chalk.bgGreen("Iniciando o accounts"));
operation()

function operation() {
    inquirer
        .prompt([{
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer ?',
            choices: ['Criar conta', 'Consulta saldo', 'Depositar', 'Sacar', 'Sair']
        },
        ]).
        then((answer) => {
            const action = answer['action']
            if (action === 'Criar conta') {
                createAccount()
            } else if (action === 'Consulta saldo') {
                    getAccountBalance()
            } else if (action === 'Depositar') {
                deposit()
            } else if (action === 'Sacar') {
                    withdraw()
            } else if (action === 'Sair') {
                console.log(chalk.bgBlue.black("Obrigado por usar o Account"));
                process.exit()
            }
        })
        .catch(err => console.log(err))
}



//create an account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));
    buildAccount()
}



function buildAccount() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para a sua conta:'
    }
    ]).then(answer => {
        const accountName = answer['accountName']
        console.log(accountName);

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe, escolha outro nomme !')
            )
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function (err) {
            console.log(err)
        }
        )
        console.log(chalk.green("Parabéns, a sua conta foi criada!"));
        operation()

    }).catch(err => console.log(err))
}


// add an amount to user account
function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta ?'
    }
    ])
        .then(answer => {
            const accountName = answer['accountName']

            //verifica se a conta existe!
            if (!cheackAccount(accountName)) {
                deposit()
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto você deseja depositar'
                },
            ])
            .then((answer =>{

                const amount = answer['amount']
                //add an amount
                addAmount(accountName,amount)
                operation()


            }))
            .catch(err => console.log(err))

        })
        .catch(err => console.log(err))
}



function cheackAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black("Esta conta não existe, escolha outro nome!"));
        return false
    }
    return true
}


function addAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
       return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.Json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err);
        }
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta !`));
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

//show account balance

function getAccountBalance(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual nome da sua conta ?'
        }
    ]).then((answer)=>{
        const accountName = answer['accountName']
        //vericar if account exists

        if(!cheackAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Olá, o saldo da sua conta é de R$${accountData.balance}`
        ));
       return operation()

    }).catch(err => console.log(err))
}

//depositando valor na conta do usuario
function withdraw(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual nome da sua conta ?'
        }
    ]).then((answer)=>{
        const accountName = answer['accountName']

        if(!cheackAccount(accountName)){
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar ?'
            }
        ]).then(answer =>{

            const amount = answer['amount']

           removeAmount(accountName, amount)

           
        }).catch(err => console.log(err))


    }).catch(err => console.log(err))
}

function removeAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed("Ocorreu um erro, tente novamente mais tarde..."));
        return withdraw()
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed("Valor indisponivel !"));
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.Json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err);
        }
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount} na sua conta`));

    operation()
}