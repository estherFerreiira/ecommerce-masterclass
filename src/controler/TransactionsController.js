
//import * as yup from "yup";
const yup = require("yup")
import parsePhoneNumber from "libphonenumber-js"
import {cpf, cnpj} from "cpf-cnpj-validator"
import Cart from "../models/Cart";
import TransactionService from "../services/TransactionService";

class TransactionsController {
     async create(req, res){
        try {
            const {
                cartCode,
                paymentType,
                installments,
                customerName,
                customerEmail,
                customerDocument,
                customerMobile,
                billingAddress,
                billingNumber,
                billingNeighborhood,
                billingCity,
                billingState,
                billingZipCode,
                creditCardNumber,
                creditCardExpiration,
                creditCardHolderName,
                creditCardCvv,
            } = req.body;

            const schema = yup.object({
                cartCode: yup.string().required(),
                paymentType: yup.mixed().oneOf(["credit_card", "billet"]),
                installments: yup.number().min(1).when("paymentType",(paymentType, schema)=>
                    paymentType === "credit_card" ? schema.max(12) : schema.max(1)
                ),
                customerName: yup.string().required().min(3),
                customerEmail: yup.string().required().email(),
                customerMobile: yup.string().required().test(
                    "is-valid-mobile", 
                    "${path} is not a mobile number",(value)=>
                    parsePhoneNumber(value, "BR").isValid()
                ),
                customerDocument: yup.string().required().test(
                    "is-valid-document",
                    "${path} is not a valid CPF / CNPJ", (value)=>
                        cpf.isValid(value) || cnpj.isValid(value)
                ),

                billingAddress: yup.string().required(),
                billingNumber: yup.string().required(),
                billingNeighborhood: yup.string().required(),
                billingCity: yup.string().required(),
                billingState: yup.string().required(),
                billingZipCode: yup.string().required(),
                creditCardNumber: yup.string().when(
                    "paymentType", (paymentType,schema)=>
                     paymentType === "credit_card" ? schema.required() : schema
                ),
                creditCardExpiration: yup.string().when(
                    "paymentType", (paymentType,schema)=>
                     paymentType === "credit_card" ? schema.required() : schema
                ),
                creditCardHolderName: yup.string().when(
                    "paymentType", (paymentType,schema)=>
                     paymentType === "credit_card" ? schema.required() : schema
                ),
                creditCardCvv: yup.string().when(
                    "paymentType", (paymentType,schema)=>
                     paymentType === "credit_card" ? schema.required() : schema
                ),

            });




            if (!(await schema.isValid(req.body))){
                return res.status(400).json({
                    erro: "Error on validade schema.",
                });
            }


            const cart =  Cart.findOne({code : cartCode});
            if(!cart){
                return res.status(404).json({
                    erro: "Não existe carrinho",
                });
            }


            const service = new TransactionService()
            const response =  await service.process({
                
                cartCode,
                paymentType,
                installments,
                
                customer:{
                    name: customerName,
                    email: customerEmail,
                    mobile: parsePhoneNumber(customerMobile, "BR").format("E.164"),
                    document: customerDocument,
                },
                billing:{
                    address: billingAddress,
                    number:billingNumber,
                    neighborhood: billingNeighborhood,
                    city: billingCity,
                    state: billingState,
                    zipCode: billingZipCode,
                },
              
               creditCard:{
                number: creditCardNumber,
                expiration: creditCardExpiration,
                holderName: creditCardHolderName,
                cvv: creditCardCvv, 
               },
            });

            return res.status(200).json(response);

        } catch (err) {
            console.log(err);
            return res.status(500).json({error: "Internal server erro."})
        }
    }
        
}
export default new TransactionsController()

/* 
"cartCode":1234,
    "paymentType":"credit_card",
    "customerName": "Esther Ferreira",
    "installments": 4,  
    "creditCardNumber": "4111.1111.1111.1111",
    "creditCardExpiration": "08/23",
    "creditCardHolderName": "Esther Ferreira",
    "creditCardCvv": "123"
*/