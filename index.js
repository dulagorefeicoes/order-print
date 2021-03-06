const printer = require('node-thermal-printer');
const interface = '/dev/usb/lp1'

printer.init({
  type: 'epson',
  interface: interface,
  width: 46,
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: true,
  replaceSpecialCharacters: true,
  extraSpecialCharacters: {
    "à": 133,
    "À": 133,
    "á": 160,
    "Á": 160,
    "é": 130,
    "É": 130,
    "í": 161,
    "Í": 161,
    "ó": 162,
    "Ó": 162,
    "ú": 163,
    "Ú": 163,
    "ã": 97,
    "Ã": 97,
    "õ": 111,
    "Õ": 111,
    "â": 131,
    "Â": 131,
    "ê": 110,
    "Ê": 69,
    "ô": 147,
    "Ô": 147,
  }
});

printer.isPrinterConnected(function (isConnected) {
  console.log('A impressora está conectada na interface ' + interface + '!');
  printer.print('->\n');
  printer.execute();
});

function toFloat(number) {

  try {

    return parseFloat(number);

  } catch (e) {

    console.log('erro com parse');

    return 0;

  }

}

function floatToBRL(number, isCurrency) {

  try {

    if (isCurrency) {
      return parseFloat(number).toFixed(2).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'BRL'
      }).replace(/\s/g, '');
    } else {
      return parseFloat(number).toFixed(2).toLocaleString('pt-BR').replace(/\s/g, '');
    }

  } catch (e) {

    console.log('problema no ParseFloat');

    return parseFloat('0').toFixed(2).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      style: 'currency',
      currency: 'BRL'
    }).replace(/\s/g, '');

  }

}

function printOrder(order = {}) {

  console.log(order.customer);

  if (order) {

    printer.setTypeFontA();

    printer.alignCenter();
    printer.printImage('./assets/DuLagoLogo-compact-black.min.png', function (done) {
      printer.alignCenter();
      printer.newLine();
      printer.bold(true);
      printer.println('MARMITARIA DU LAGO');
      printer.bold(false);
      printer.setTextNormal();
      printer.println('Rua Benjamin Caetano Zanbom, 988');
      printer.println('Bandeirantes - PR');
      printer.println('(43) 3542-0021');

      printer.println('------------------------------------------------');
      printer.newLine();
      printer.alignLeft();

      // consumer name
      if (order.customer)
        if (order.customer.customerName) {
          printer.setTextDoubleHeight();
          printer.print('Cliente: ');
          printer.bold(true);
          printer.print(order.customer.customerName);
          printer.setTextNormal();
          printer.bold(false);
          printer.newLine();
        }

      // delivery time
      if (order.deliveryTime !== false) {

        printer.setTextDoubleHeight();
        printer.print(!!order.delivery ? 'Entrega: ' : 'Retirada: ');
        printer.bold(true);
        printer.print(order.deliveryTime.time);

        if (!order.delivery)
          printer.print(' (AQUI)');

        printer.setTextNormal();
        printer.bold(false);
        printer.newLine();

      } else {

        printer.setTextDoubleHeight();
        printer.print(!!order.delivery ? 'Entrega: ' : 'Retirada: ');
        printer.bold(true);
        printer.print(!order.delivery ? 'AQUI' : '???');
        printer.setTextNormal();
        printer.bold(false);
        printer.newLine();

      }

      printer.newLine();

      // table header
      printer.tableCustom([
        {
          text: 'Item',
          align: 'LEFT',
          width: .8
        },
        {
          text: 'Total',
          align: 'LEFT',
          width: .2
        }
      ]);

      // order items
      if (order.items) {

        printer.setTextDoubleHeight();

        let orderItems = Object.values(order.items);
        orderItems.forEach(orderItem => {

          printer.tableCustom([
            {
              text: orderItem.quantity + '-' + orderItem.itemName + ' (' + orderItem.itemPrice + ')',
              align: 'LEFT',
              width: .8,
              bold: true
            },
            {
              text: floatToBRL(orderItem.itemPrice * orderItem.quantity),
              align: 'LEFT',
              width: .2
            }
          ]);

          if (orderItem.note) {
            printer.setTextNormal();
            printer.println('  ' + orderItem.note.replace(/\n/g, '\n  '));
            printer.setTextDoubleHeight();
          }

        });

      }

      if (order.billing) {

        printer.setTextNormal();
        printer.println('------------------------------------------------');

        // priceAmount
        if (order.billing.priceAmount) {

          if (order.billing.payments)
            if (Object.values(order.billing.payments).length === 1) {
              printer.tableCustom([
                {
                  text: 'Total:  ',
                  align: 'RIGHT',
                  width: .8
                },
                {
                  text: floatToBRL(order.billing.priceAmount, true),
                  align: 'LEFT',
                  bold: true,
                  width: .2
                }
              ]);
            } else {
              printer.tableCustom([
                {
                  text: 'Total:  ',
                  align: 'RIGHT',
                  width: .65
                },
                {
                  text: floatToBRL(order.billing.priceAmount, true),
                  align: 'LEFT',
                  bold: true,
                  width: .35
                }
              ]);
            }

        }

        // payments
        if (order.billing.payments) {
          printer.newLine();
          let orderItems = Object.values(order.billing.payments);
          orderItems.forEach(orderPaymentItem => {

            if (orderPaymentItem.method === 'money') {

              if (orderPaymentItem.isDefault) {

                printer.tableCustom([
                  {
                    text: 'Pago (Dinheiro):  ',
                    align: 'RIGHT',
                    width: .8
                  },
                  {
                    text: floatToBRL(orderPaymentItem.paidValue, true),
                    align: 'LEFT',
                    bold: true,
                    width: .2
                  }
                ]);

              } else {

                printer.tableCustom([
                  {
                    text: 'Pago (Dinheiro):  ',
                    align: 'RIGHT',
                    width: .65
                  },
                  {
                    text: floatToBRL(orderPaymentItem.paidValue, true) + '->' + floatToBRL(orderPaymentItem.referenceValue, true),
                    align: 'LEFT',
                    bold: true,
                    width: .35
                  }
                ]);

              }

              printer.tableCustom([
                {
                  text: 'Troco:  ',
                  align: 'RIGHT',
                  width: .65
                },
                {
                  text: floatToBRL(toFloat(orderPaymentItem.paidValue) - toFloat(orderPaymentItem.referenceValue), true),
                  align: 'LEFT',
                  bold: true,
                  width: .35
                }
              ]);


            } else if (orderPaymentItem.method === 'card') {

              if (orderPaymentItem.isDefault) {

                printer.tableCustom([
                  {
                    text: 'Pago (Cartão):  ',
                    align: 'RIGHT',
                    width: .8
                  },
                  {
                    text: floatToBRL(orderPaymentItem.paidValue, true),
                    align: 'LEFT',
                    bold: true,
                    width: .2
                  }
                ]);

              } else {

                printer.tableCustom([
                  {
                    text: 'Pago (Cartão):  ',
                    align: 'RIGHT',
                    width: .65
                  },
                  {
                    text: floatToBRL(orderPaymentItem.paidValue, true) + '->' + floatToBRL(orderPaymentItem.referenceValue, true),
                    align: 'LEFT',
                    bold: true,
                    width: .35
                  }
                ]);

              }

            } else if (orderPaymentItem.method === 'paid') {

              if (orderPaymentItem.isDefault) {

                printer.tableCustom([
                  {
                    text: 'Pago:  ',
                    align: 'RIGHT',
                    width: .8
                  },
                  {
                    text: 'PAGO',
                    align: 'LEFT',
                    bold: true,
                    width: .2
                  }
                ]);

              } else {

                printer.tableCustom([
                  {
                    text: 'Pago (desconto):  ',
                    align: 'RIGHT',
                    width: .65
                  },
                  {
                    text: floatToBRL(orderPaymentItem.paidValue, true),
                    align: 'LEFT',
                    bold: true,
                    width: .35
                  }
                ]);

              }

            } else if (orderPaymentItem.method === 'gift') {

              if (orderPaymentItem.isDefault) {

                printer.tableCustom([
                  {
                    text: 'Pago:  ',
                    align: 'RIGHT',
                    width: .8
                  },
                  {
                    text: 'CORTESIA',
                    align: 'LEFT',
                    bold: true,
                    width: .2
                  }
                ]);

              } else {

                printer.tableCustom([
                  {
                    text: 'Pago (cortesia):  ',
                    align: 'RIGHT',
                    width: .65,
                    bold: true
                  },
                  {
                    text: floatToBRL(orderPaymentItem.paidValue, true),
                    align: 'LEFT',
                    bold: true,
                    width: .35
                  }
                ]);

              }

            }

          });

        } else {

          printer.alignCenter();
          printer.println('VERIFICAR DADOS DE PAGAMENTO \n COM O ATENDIMENTO');
          printer.alignLeft();

        }

      }

      // delivery
      if (order.delivery) {

        printer.setTextNormal();
        printer.bold(false);
        printer.println('------------------------------------------------');

        try {

          printer.newLine();

          if (order.address) {

            printer.alignLeft();

            if (order.address.street) {
              printer.print('Endereço: ');
              if (order.address.street.length > 28) printer.print('\n  ');
              printer.print(order.address.street);
              if (order.address.houseNumber)
                printer.print(', ' + order.address.houseNumber);
              printer.newLine();
            }

            if (order.address.neighborhood) {
              printer.print('Bairro: ');
              printer.print(order.address.neighborhood);
              printer.newLine();
            }

            if (order.address.addressReference) {
              printer.print('Referência: ');
              printer.print(order.address.addressReference);
              printer.newLine();
            }

          } else {

            printer.println('ENTREGA (FALTA ENDEREÇO)');

          }

        } catch (e) {

          console.log('eita.. houve algum erro tentando imprimir o endereço');

        }

        printer.newLine();

      } else {

        printer.println('------------------------------------------------');
        printer.newLine();
        printer.setTextDoubleHeight();
        printer.bold(true);
        printer.println('Retirada: AQUI');
        printer.bold(false);
        printer.setTextNormal();

      }

      printer.cut();
      printer.execute();

    });

  }

}

// server options and API routes

const ngrok = require('ngrok');
const admin = require('firebase-admin');
const isOnline = require('is-online');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = 8080;
const serviceAccount = require('./dulago-app-firebase-adminsdk-ey4a2-12aff49d26');
let printServerRef = false;

async function createTunnel() {

  (async () => {

    const url = await ngrok.connect(port);

    if (printServerRef) {
      printServerRef.set({
        url: url
      });
      console.log('\x1b[32m' + 'Tunel seguro (SSL) criado no endereço: ' + url, '\x1b[0m');
      console.log('\x1b[35m' + 'Desejo a todas inimigas vida longa', '\x1b[0m');
      console.log('\x1b[35m' + 'Pra que elas vejam cada dia mais nossa vitória', '\x1b[0m');
      console.log('\x1b[35m' + 'Bateu de frente é só tiro, porrada e bomba', '\x1b[0m');
      console.log('\x1b[35m' + 'Aqui dois papos não se cria e não faz história', '\x1b[0m');
    }

  })();

}

try {
  isOnline({
    timeout: 5000,
    version: "v4"
  }).then(online => {
    if (online) {

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://dulago-app.firebaseio.com"
      });
      const db = admin.database();
      printServerRef = db.ref('printServer');

      createTunnel();

    } else {
      console.warn('Este servidor não está conectado, verifique a conexão e me reinicie!');
    }
  });
} catch (e) {
  console.log(e);
}

app.use(bodyParser.text());

app.route('/')
  .get((req, res) => res.send('PrintServer is Connected!'));

app.route('/print')
  .post((req, res) => {
    if (req.body) {
      printOrder(JSON.parse(req.body));
      res.send(true)
    } else {
      res.send(false);
    }
  });

server.listen(port);

io.on('connection', function (socket) {

  console.log('Um novo usuário se conectou ao servidor');

  socket.on('print order', order => printOrder(order));
});