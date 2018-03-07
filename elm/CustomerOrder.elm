module CustomerOrder exposing (..)

import Date exposing (Date)
import Html exposing (div, text, tr, td, th, p)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Json.Encode
import Utils.Date
import RemoteData exposing (WebData)
import Contact.Model exposing (Contact, ContactId(..), initContact)
import Contact.Decoder exposing (contactDecoder)
import CustomerOrder.Model exposing (CustomerOrderId(..), customerOrderIdToString)
import DispatchOrder.Model exposing (DispatchOrder, dispatchOrderIdToString)
import DispatchOrder.Decoder exposing (dispatchOrderDecoder)
import Html.Texenergo exposing (pageHeader)
import Html.Texenergo.Button exposing (button)
import IncomingTransfer.Model exposing (IncomingTransfer, incomingTransferIdToString, incomingTransferPath)
import IncomingTransfer.Decoder exposing (incomingTransferDecoder)
import Partner.Model exposing (Partner, partnerIdToString)
import Partner.Decoder exposing (partnerDecoder)
import Product.Model exposing (Product, ProductId(..), productIdToString)
import Product.Decoder exposing (productDecoder)
import Texenergo.Flags exposing (..)
import Utils.Currency


type PartnerType
    = Issuer
    | Payer
    | Receiver


type SearchQuery
    = SearchQuery String


type CustomerOrderContentId
    = CustomerOrderContentId String


type Quantity
    = Quantity Int


type AddableQuantity
    = AddableQuantity Int


type alias Model =
    { customerOrder : WebData CustomerOrder
    , flags : Flags
    , searchQuery : SearchQuery
    , searchResults : WebData (List SearchResult)
    }


type alias Event =
    { action : String, name : String }


type alias CustomerOrderContent =
    { canDestroy : Bool
    , canEdit : Bool
    , cancellableQuantity : Int
    , comment : String
    , deliveryTerms : String
    , discount : Maybe Int
    , discountDescription : String
    , id : CustomerOrderContentId
    , price : Float
    , product : Product
    , quantity : Maybe Quantity
    , queryOriginal : String
    , remains : Int
    , stock : Int
    }


type alias CustomerOrder =
    { canConfirm : Bool
    , canDestroy : Bool
    , canEdit : Bool
    , customerOrderContents : List CustomerOrderContent
    , date : Date
    , description : String
    , dispatchOrders : List DispatchOrder
    , dispatchedAmount : Float
    , events : List Event
    , id : CustomerOrderId
    , incomingTransfers : List IncomingTransfer
    , issuedBy : Partner
    , managerName : String
    , number : String
    , paid_amount : Float
    , partner : Partner
    , payer : Partner

    -- , quotationOrders : List String
    , recipients : List Contact
    , status : String
    , title : String
    , total : Float
    }


type alias SearchResult =
    { product : Product
    , imageUrl : String
    , price : Float
    , stock : Quantity
    , addableQuantity : Maybe AddableQuantity
    }


type Msg
    = FetchCustomerOrder CustomerOrderId
    | FetchedCustomerOrder (WebData CustomerOrder)
    | RefreshCustomerOrder CustomerOrderId
    | FlipPartnerEditability PartnerType
    | ContentQuantityChanged CustomerOrderContentId String
    | ContentDiscountChanged CustomerOrderContentId String
    | CustomerOrderContentUpdated CustomerOrderContentId (Result Http.Error CustomerOrderContent)
    | DestroyContentClicked CustomerOrderContentId
    | DestroyedContent CustomerOrderContentId (Result Http.Error ())
    | SearchQueryChanged String
    | FetchedSearchResults (WebData (List SearchResult))
    | SearchResultQuantityChanged Product.Model.ProductId String
    | ProductAddClicked ProductId (Maybe AddableQuantity)
    | ProductAdded (Result Http.Error CustomerOrderContent)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        changeQuantity : CustomerOrder -> CustomerOrderContentId -> Maybe Int -> CustomerOrder
        changeQuantity co cocId newValue =
            { co
                | customerOrderContents =
                    List.map
                        (\x ->
                            (if x.id == cocId then
                                { x | quantity = Maybe.map Quantity newValue }
                             else
                                x
                            )
                        )
                        co.customerOrderContents
            }

        changeAddableQuantity : List SearchResult -> ProductId -> Maybe AddableQuantity -> List SearchResult
        changeAddableQuantity searchResults productId newValue =
            List.map
                (\result ->
                    (if result.product.id == productId then
                        { result | addableQuantity = newValue }
                     else
                        result
                    )
                )
                searchResults

        changeDiscount : CustomerOrder -> CustomerOrderContentId -> Maybe Int -> CustomerOrder
        changeDiscount co cocId newValue =
            { co
                | customerOrderContents =
                    List.map
                        (\x ->
                            (if x.id == cocId then
                                { x | discount = newValue }
                             else
                                x
                            )
                        )
                        co.customerOrderContents
            }

        changeContent : CustomerOrder -> CustomerOrderContent -> CustomerOrder
        changeContent customerOrder newCustomerOrderContent =
            { customerOrder
                | customerOrderContents =
                    List.map
                        (\x ->
                            (if x.id == newCustomerOrderContent.id then
                                newCustomerOrderContent
                             else
                                x
                            )
                        )
                        customerOrder.customerOrderContents
            }

        filterOutContent : CustomerOrder -> CustomerOrderContentId -> CustomerOrder
        filterOutContent customerOrder customerOrderContentid =
            { customerOrder
                | customerOrderContents =
                    List.filter
                        (\x ->
                            x.id /= customerOrderContentid
                        )
                        customerOrder.customerOrderContents
            }
    in
        case msg of
            FetchCustomerOrder customerOrderId ->
                ( model
                , fetchCustomerOrder model.flags.apiEndpoint model.flags.apiAuthToken customerOrderId
                )

            FetchedCustomerOrder custOrd ->
                ( { model | customerOrder = custOrd }, Cmd.none )

            RefreshCustomerOrder customerOrderId ->
                ( model
                , fetchCustomerOrder model.flags.apiEndpoint model.flags.apiAuthToken customerOrderId
                )

            FlipPartnerEditability _ ->
                ( model, Cmd.none )

            ContentQuantityChanged contentId newValue ->
                case ( String.toInt newValue, model.customerOrder ) of
                    ( Ok x, RemoteData.Success customerOrder ) ->
                        ( { model
                            | customerOrder = changeQuantity customerOrder contentId (Just x) |> RemoteData.succeed
                          }
                        , updateQuantity model customerOrder.id contentId x
                        )

                    ( _, RemoteData.Success customerOrder ) ->
                        if newValue == "" then
                            ( { model
                                | customerOrder = changeQuantity customerOrder contentId Nothing |> RemoteData.succeed
                              }
                            , Cmd.none
                            )
                        else
                            ( model, Cmd.none )

                    ( _, _ ) ->
                        ( model, Cmd.none )

            ContentDiscountChanged contentId newValue ->
                case ( String.toInt newValue, model.customerOrder ) of
                    ( Ok x, RemoteData.Success customerOrder ) ->
                        ( { model
                            | customerOrder = changeDiscount customerOrder contentId (Just x) |> RemoteData.succeed
                          }
                        , updateDiscount model customerOrder.id contentId x
                        )

                    ( _, RemoteData.Success customerOrder ) ->
                        if newValue == "" then
                            ( { model
                                | customerOrder = changeDiscount customerOrder contentId Nothing |> RemoteData.succeed
                              }
                            , Cmd.none
                            )
                        else
                            ( model, Cmd.none )

                    ( _, _ ) ->
                        ( model, Cmd.none )

            CustomerOrderContentUpdated cocId (Result.Ok newCustomerOrderContent) ->
                case model.customerOrder of
                    RemoteData.Success customerOrder ->
                        ( { model
                            | customerOrder = changeContent customerOrder newCustomerOrderContent |> RemoteData.succeed
                          }
                        , Cmd.none
                        )

                    _ ->
                        ( model, Cmd.none )

            CustomerOrderContentUpdated cocId (Result.Err err) ->
                ( model, Cmd.none )

            DestroyContentClicked cocId ->
                case model.customerOrder of
                    RemoteData.Success customerOrder ->
                        ( model, (destroyContent model.flags.apiEndpoint model.flags.apiAuthToken customerOrder.id cocId) )

                    _ ->
                        ( model, Cmd.none )

            DestroyedContent cocId (Result.Ok x) ->
                case model.customerOrder of
                    RemoteData.Success customerOrder ->
                        ( { model
                            | customerOrder = filterOutContent customerOrder cocId |> RemoteData.succeed
                          }
                        , Cmd.none
                        )

                    _ ->
                        ( model, Cmd.none )

            DestroyedContent cocId (Result.Err _) ->
                ( model, Cmd.none )

            SearchQueryChanged newString ->
                ( { model | searchQuery = (SearchQuery newString), searchResults = RemoteData.Loading }
                , fetchProductSearch model.flags.apiEndpoint model.flags.apiAuthToken (SearchQuery newString)
                )

            FetchedSearchResults searchResults ->
                ( { model | searchResults = searchResults }
                , Cmd.none
                )

            SearchResultQuantityChanged productId newValue ->
                case ( String.toInt newValue, model.searchResults ) of
                    ( Ok x, RemoteData.Success searchResults ) ->
                        ( { model
                            | searchResults = changeAddableQuantity searchResults productId (Just (AddableQuantity x)) |> RemoteData.succeed
                          }
                        , Cmd.none
                        )

                    ( _, RemoteData.Success searchResults ) ->
                        if newValue == "" then
                            ( { model
                                | searchResults = changeAddableQuantity searchResults productId Nothing |> RemoteData.succeed
                              }
                            , Cmd.none
                            )
                        else
                            ( model, Cmd.none )

                    ( _, _ ) ->
                        ( model, Cmd.none )

            ProductAddClicked productId mAddableQuantity ->
                case ( mAddableQuantity, model.customerOrder ) of
                    ( Just (AddableQuantity addableQ), RemoteData.Success customerOrder ) ->
                        if addableQ > 0 then
                            ( model
                            , createCustomerOrderContent
                                model.flags.apiEndpoint
                                model.flags.apiAuthToken
                                customerOrder.id
                                productId
                                addableQ
                                model.searchQuery
                            )
                        else
                            ( model, Cmd.none )

                    ( _, _ ) ->
                        ( model, Cmd.none )

            ProductAdded (Result.Ok newCustomerOrderContent) ->
                case ( model.searchResults, model.customerOrder ) of
                    ( RemoteData.Success searchResults, RemoteData.Success customerOrder ) ->
                        ( { model
                            | customerOrder =
                                ({ customerOrder
                                    | customerOrderContents = (List.singleton newCustomerOrderContent |> (++) customerOrder.customerOrderContents)
                                 }
                                )
                                    |> RemoteData.succeed
                            , searchResults =
                                (List.filter (\sr -> sr.product.id /= newCustomerOrderContent.product.id) searchResults |> RemoteData.succeed)
                          }
                        , Cmd.none
                        )

                    ( _, RemoteData.Success customerOrder ) ->
                        ( { model
                            | customerOrder =
                                ({ customerOrder
                                    | customerOrderContents = (List.singleton newCustomerOrderContent |> (++) customerOrder.customerOrderContents)
                                 }
                                )
                                    |> RemoteData.succeed
                          }
                        , Cmd.none
                        )

                    ( _, _ ) ->
                        ( model, Cmd.none )

            ProductAdded (Result.Err err) ->
                ( model, Cmd.none )


updateDiscount : Model -> CustomerOrderId -> CustomerOrderContentId -> Int -> Cmd Msg
updateDiscount m coId cocId newDiscount =
    updateGeneric m coId cocId (Json.Encode.object [ ( "discount", Json.Encode.int newDiscount ) ])


updateQuantity : Model -> CustomerOrderId -> CustomerOrderContentId -> Int -> Cmd Msg
updateQuantity m coId cocId newQuantity =
    updateGeneric m coId cocId (Json.Encode.object [ ( "quantity", Json.Encode.int newQuantity ) ])


updateGeneric : Model -> CustomerOrderId -> CustomerOrderContentId -> Json.Encode.Value -> Cmd Msg
updateGeneric m (CustomerOrderId coId) (CustomerOrderContentId cocId) newValue =
    Http.request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ (apiAuthTokenToString m.flags.apiAuthToken))
            ]
        , url = (endpointToString m.flags.apiEndpoint) ++ "/customer_orders/" ++ coId ++ "/customer_order_contents/" ++ cocId
        , body = Http.jsonBody newValue
        , expect = Http.expectJson customerOrderContentDecoder
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send (CustomerOrderContentUpdated (CustomerOrderContentId cocId))


destroyContent : Endpoint -> ApiAuthToken -> CustomerOrderId -> CustomerOrderContentId -> Cmd Msg
destroyContent (Endpoint aep) (ApiAuthToken at) (CustomerOrderId customerOrderId) (CustomerOrderContentId cocId) =
    Http.request
        { method = "DELETE"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ at)
            ]
        , url = aep ++ "/customer_orders/" ++ customerOrderId ++ "/customer_order_contents/" ++ cocId
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send (DestroyedContent (CustomerOrderContentId cocId))


createCustomerOrderContent : Endpoint -> ApiAuthToken -> CustomerOrderId -> ProductId -> Int -> SearchQuery -> Cmd Msg
createCustomerOrderContent (Endpoint aep) (ApiAuthToken at) (CustomerOrderId customerOrderId) (ProductId productId) quantity (SearchQuery searchQuery) =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ at)
            ]
        , url = aep ++ "/customer_orders/" ++ customerOrderId ++ "/customer_order_contents/"
        , body =
            Http.jsonBody
                (Json.Encode.object
                    [ ( "product_id", Json.Encode.string productId )
                    , ( "quantity", Json.Encode.int quantity )
                    , ( "query_original", Json.Encode.string searchQuery )
                    ]
                )
        , expect = Http.expectJson customerOrderContentDecoder
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send ProductAdded


customerOrderContentDecoder : Decode.Decoder CustomerOrderContent
customerOrderContentDecoder =
    Decode.succeed CustomerOrderContent
        |> required "can_destroy" bool
        |> required "can_edit" bool
        |> required "cancellable_quantity" int
        |> required "comment" string
        |> required "delivery_terms" string
        |> required "discount" (int |> Decode.map Just)
        |> required "discount_description" string
        |> required "id" (string |> Decode.map CustomerOrderContentId)
        |> required "price" float
        |> required "product" productDecoder
        |> required "quantity" (int |> Decode.map Quantity |> Decode.map Just)
        |> required "query_original" string
        |> required "remains" int
        |> required "stock" int


eventDecoder : Decode.Decoder Event
eventDecoder =
    Decode.succeed Event
        |> required "event" string
        |> required "name" string


customerOrderFullDecoder : Decode.Decoder CustomerOrder
customerOrderFullDecoder =
    Decode.succeed CustomerOrder
        |> required "can_confirm" bool
        |> required "can_destroy" bool
        |> required "can_edit" bool
        |> required "customer_order_contents" (Decode.list customerOrderContentDecoder)
        |> required "date" Utils.Date.decoder
        |> required "description" string
        |> required "dispatch_orders" (Decode.list dispatchOrderDecoder)
        |> required "dispatched_amount" float
        |> required "events" (Decode.list eventDecoder)
        |> required "id" (string |> Decode.map CustomerOrderId)
        |> required "incoming_transfers" (Decode.list incomingTransferDecoder)
        |> required "issued_by" partnerDecoder
        |> required "manager_name" string
        |> required "number" string
        |> required "paid_amount" float
        |> required "partner" partnerDecoder
        |> required "payer" partnerDecoder
        -- |> required "quotation_orders" (Decode.list string)
        |> required "recipients" (Decode.list contactDecoder)
        |> required "status" string
        |> required "title" string
        |> required "total" float


searchResultDecoder : Decode.Decoder SearchResult
searchResultDecoder =
    Decode.map5 (SearchResult)
        productDecoder
        (Decode.field "image_url" string)
        (Decode.field "price" float)
        (Decode.map Quantity (Decode.field "stock" int))
        (Decode.succeed Nothing)


searchResultsDecoder : Decode.Decoder (List SearchResult)
searchResultsDecoder =
    Decode.list searchResultDecoder


fetchProductSearch : Endpoint -> ApiAuthToken -> SearchQuery -> Cmd Msg
fetchProductSearch (Endpoint aep) (ApiAuthToken at) (SearchQuery query) =
    let
        endpoint =
            aep ++ "/products/search?term=" ++ query
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ at)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson searchResultsDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedSearchResults


fetchCustomerOrder : Endpoint -> ApiAuthToken -> CustomerOrderId -> Cmd Msg
fetchCustomerOrder (Endpoint aep) (ApiAuthToken at) (CustomerOrderId coid) =
    let
        endpoint =
            aep ++ "/customer_orders/" ++ coid
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ at)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson customerOrderFullDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedCustomerOrder


customerOrderContentTotal : CustomerOrderContent -> Float
customerOrderContentTotal coc =
    case coc.quantity of
        Just (Quantity q) ->
            (toFloat q) * coc.price * (1.0 - (Maybe.withDefault 0 coc.discount |> toFloat) / 100)

        Nothing ->
            0.0


customerOrderTotal : CustomerOrder -> String
customerOrderTotal customerOrder =
    List.foldl (\cont -> (+) (customerOrderContentTotal cont)) 0 customerOrder.customerOrderContents |> Utils.Currency.toCurrency


viewDispatchOrder : DispatchOrder -> Html.Html Msg
viewDispatchOrder dispatchOrder =
    tr []
        [ td [] [ Html.a [ dispatchOrderIdToString dispatchOrder.id |> (++) "/#/dispatch_orders/" |> Html.Attributes.href ] [ text dispatchOrder.number ] ]
        , td [] [ Utils.Date.toHumanShort dispatchOrder.date |> text ]
        , td [] [ Utils.Currency.toCurrency dispatchOrder.total |> text ]
        ]


viewIncomingTransfer : IncomingTransfer -> Html.Html Msg
viewIncomingTransfer incomingTransfer =
    tr []
        [ td []
            [ Html.a [ incomingTransferPath incomingTransfer.id |> Html.Attributes.href ]
                [ text incomingTransfer.number
                ]
            ]
        , td [] [ Utils.Date.toHumanShort incomingTransfer.date |> text ]
        , td [] [ Utils.Currency.toCurrency incomingTransfer.total |> text ]
        ]


viewDocumentsBlock : CustomerOrder -> Html.Html Msg
viewDocumentsBlock co =
    Html.span []
        [ Html.table [ class "table table-hover" ]
            [ Html.thead []
                [ tr []
                    [ th [] [ text "Номер документа" ]
                    , th [] [ text "Дата документа" ]
                    , th [] [ text "Сумма документа" ]
                    ]
                ]
            , Html.tbody []
                (List.append
                    (List.map viewDispatchOrder co.dispatchOrders)
                    [ tr []
                        [ td [] []
                        , td [] [ text "Итого, руб:" ]
                        , td [] [ List.foldl (\disOrd -> (+) disOrd.total) 0 co.dispatchOrders |> Utils.Currency.toCurrency |> text ]
                        ]
                    ]
                )
            ]
        , Html.table [ class "table table-hover" ]
            [ Html.thead []
                [ tr []
                    [ th [] [ text "Вх. номер" ]
                    , th [] [ text "Вх. дата" ]
                    , th [] [ text "Сумма документа" ]
                    ]
                ]
            , Html.tbody []
                (List.append
                    (List.map viewIncomingTransfer co.incomingTransfers)
                    [ tr []
                        [ td [] []
                        , td [] [ text "Итого, руб:" ]
                        , td [] [ List.foldl (\incTransf -> (+) incTransf.total) 0 co.incomingTransfers |> Utils.Currency.toCurrency |> text ]
                        ]
                    ]
                )
            ]
        ]


viewContent : CustomerOrder -> Int -> CustomerOrderContent -> Html.Html Msg
viewContent co i coc =
    let
        conditionalColumn : Html.Html Msg -> CustomerOrder -> Html.Html Msg
        conditionalColumn mes customerOrder =
            if customerOrder.canEdit then
                td [ class "text-right" ] [ mes ]
            else
                Html.text ""

        quantityToColor : CustomerOrderContent -> String
        quantityToColor custOrdCont =
            case custOrdCont.quantity of
                Just (Quantity q) ->
                    if (q <= custOrdCont.stock) then
                        "success"
                    else if (custOrdCont.stock == 0) then
                        "danger"
                    else if (custOrdCont.stock > 0) then
                        "warning"
                    else
                        ""

                Nothing ->
                    ""

        quantityColumn : CustomerOrder -> CustomerOrderContent -> Html.Html Msg
        quantityColumn co coc =
            td [ class ("text-right " ++ (quantityToColor coc)) ]
                [ if co.canEdit then
                    (Html.input
                        [ (Html.Attributes.value (quantityToString coc.quantity))
                        , Html.Attributes.style
                            [ ( "text-align", "right" )
                            , ( "border", "none" )
                            , ( "background-color", "transparent" )
                            , ( "border-bottom", "dashed 1px #08c" )
                            ]
                        , onInput (ContentQuantityChanged coc.id)
                        ]
                        [ quantityToString coc.quantity |> text ]
                    )
                  else
                    quantityToString coc.quantity |> text
                ]

        discountColumn : CustomerOrder -> CustomerOrderContent -> Html.Html Msg
        discountColumn co coc =
            if co.canEdit then
                td []
                    [ (Html.input
                        [ (Html.Attributes.value (Maybe.withDefault 0 coc.discount |> toString))
                        , Html.Attributes.style
                            [ ( "text-align", "right" )
                            , ( "border", "none" )
                            , ( "background-color", "transparent" )
                            , ( "border-bottom", "dashed 1px #08c" )
                            ]
                        , onInput (ContentDiscountChanged coc.id)
                        ]
                        []
                      )
                    ]
            else
                Html.text ""

        quantityToString : Maybe Quantity -> String
        quantityToString mQ =
            case mQ of
                Just (Quantity q) ->
                    toString q

                Nothing ->
                    ""
    in
        tr
            []
            [ td [] [ i + 1 |> toString |> text ]
            , td []
                [ Html.a [ productIdToString coc.product.id |> (++) "/#/products/" |> Html.Attributes.href ] [ text coc.product.name ]
                ]
            , td [] [ text coc.product.article ]
            , conditionalColumn (Utils.Currency.toCurrency coc.price |> text) co
            , quantityColumn co coc
            , discountColumn co coc
            , td [ class "text-right" ] [ customerOrderContentTotal coc |> Utils.Currency.toCurrency |> text ]
            , td []
                [ if co.canEdit && coc.canDestroy then
                    div [ class "btn btn-danger", DestroyContentClicked coc.id |> onClick ]
                        [ Html.i [ class "fa fa-trash-o" ] []
                        ]
                  else
                    toString coc.remains |> text
                ]
            ]


viewContentsBlock : CustomerOrder -> Html.Html Msg
viewContentsBlock co =
    let
        conditionalColumn : Html.Html Msg -> CustomerOrder -> Html.Html Msg
        conditionalColumn mes customerOrder =
            if customerOrder.canEdit then
                th [ class "text-right" ] [ mes ]
            else
                Html.text ""
    in
        Html.span []
            [ Html.h1 [] [ text "Состав заказа" ]
            , Html.table [ class "table table-hover table-bordered margin-top-10" ]
                [ Html.thead []
                    [ tr []
                        [ th [] []
                        , th [] [ text "Наименование" ]
                        , th [] [ text "Артикул" ]
                        , conditionalColumn (text "Цена") co
                        , th [ class "text-right" ] [ text "Кол-во" ]
                        , conditionalColumn (text "Скидка") co
                        , th [ class "text-right" ] [ text "Итого" ]
                        , conditionalColumn
                            ((if co.canEdit then
                                ""
                              else
                                "Осталось отгрузить"
                             )
                                |> text
                            )
                            co
                        ]
                    ]
                , Html.tbody []
                    (List.append
                        (List.indexedMap (viewContent co) co.customerOrderContents)
                        [ tr []
                            [ td [] []
                            , td [] [ text "Итого, руб:" ]
                            , td [] [ customerOrderTotal co |> text ]
                            ]
                        ]
                    )
                ]
            ]


viewMetaBlock : CustomerOrder -> Html.Html Msg
viewMetaBlock customerOrder =
    let
        avoidEmpty : String -> String
        avoidEmpty str =
            if str == "" then
                "Нет"
            else
                str

        displayPartner : Partner -> PartnerType -> Html.Html Msg
        displayPartner partner partnerType =
            if customerOrder.canEdit then
                Html.span [ onClick (FlipPartnerEditability partnerType) ]
                    [ Html.input [] [ text partner.name ]
                    , text " (Изменить)"
                    ]
            else
                Html.a [ partnerIdToString partner.id |> (++) "/#/partners/" |> Html.Attributes.href ] [ text partner.name ]
    in
        div [ class "row margin-top-10" ]
            [ p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Свой номер:" ]
            , p [ class "col-md-9 ng-binding" ] [ avoidEmpty customerOrder.title |> text ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Описание:" ]
            , p [ class "col-md-9 ng-binding" ] [ avoidEmpty customerOrder.description |> text ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Дата заказа:" ]
            , p [ class "col-md-9 ng-binding" ] [ Utils.Date.toHumanShort customerOrder.date |> text ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Продавец:" ]
            , p [ class "col-md-9 ng-binding" ] [ displayPartner customerOrder.issuedBy Issuer ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Покупатель:" ]
            , p [ class "col-md-9 ng-binding" ] [ displayPartner customerOrder.partner Receiver ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Плательщик:" ]
            , p [ class "col-md-9 ng-binding" ] [ displayPartner customerOrder.payer Payer ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Статус:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.status ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Менеджер:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.managerName ]
            ]


viewSearchBlock : CustomerOrder -> WebData (List SearchResult) -> Html.Html Msg
viewSearchBlock customerOrder wdSearchResults =
    let
        viewSearchStock : Quantity -> String
        viewSearchStock (Quantity x) =
            toString x

        viewSearchResult : SearchResult -> Html.Html Msg
        viewSearchResult searchResult =
            tr []
                [ td [ Html.Attributes.style [ ( "width", "60px" ) ] ]
                    [ Html.img
                        [ Html.Attributes.src searchResult.imageUrl
                        , Html.Attributes.style [ ( "max-width", "40px" ), ( "max-height", "40px" ) ]
                        ]
                        []
                    ]
                , td []
                    [ Html.a
                        [ productIdToString searchResult.product.id |> (++) "/#/products/" |> Html.Attributes.href
                        ]
                        [ text searchResult.product.name ]
                    ]
                , td [] [ text searchResult.product.article ]
                , td [ class "text-right" ] [ searchResult.price |> Utils.Currency.toCurrency |> text ]
                , td [ class "text-right" ] [ ((viewSearchStock searchResult.stock) ++ " ед") |> text ]
                , td []
                    [ Html.input
                        [ onInput (SearchResultQuantityChanged searchResult.product.id)
                        , Maybe.map toString searchResult.addableQuantity |> Maybe.withDefault "" |> Html.Attributes.value
                        , Html.Attributes.placeholder "Введите кол-во"
                        ]
                        []
                    , div
                        [ class "btn btn-xs btn-success"
                        , onClick (ProductAddClicked searchResult.product.id searchResult.addableQuantity)
                        ]
                        [ Html.i [ class "fa fa-plus" ] []
                        ]
                    ]
                ]

        viewEmptyRow : String -> Html.Html Msg
        viewEmptyRow str =
            tr []
                [ td [ Html.Attributes.colspan 6, class "text-center" ] [ text str ]
                ]

        viewSearchResults : WebData (List SearchResult) -> Html.Html Msg
        viewSearchResults wd =
            Html.table [ class "table table-hover table-bordered margin-top-10" ]
                [ Html.thead []
                    [ tr []
                        [ th [ Html.Attributes.style [ ( "width", "60px" ) ] ] []
                        , th [] [ text "Наименование" ]
                        , th [] [ text "Артикул" ]
                        , th [] [ text "Цена" ]
                        , th [] [ text "Остаток" ]
                        , th [] []
                        ]
                    ]
                , Html.tbody []
                    (case wd of
                        RemoteData.Success results ->
                            if List.length results > 0 then
                                (List.map viewSearchResult results)
                            else
                                [ viewEmptyRow "Ничего не найдено" ]

                        RemoteData.Loading ->
                            [ viewEmptyRow "Загружается" ]

                        RemoteData.NotAsked ->
                            [ viewEmptyRow "Введите поисковый запрос" ]

                        RemoteData.Failure _ ->
                            [ viewEmptyRow "Ошибка" ]
                    )
                ]
    in
        if customerOrder.canEdit then
            div [ class "well well-white" ]
                [ Html.h1 [] [ text "Добавление товаров" ]
                , Html.input
                    [ Html.Attributes.placeholder "Введите товар для добавления..."
                    , Html.Attributes.style [ ( "width", "100%" ), ( "padding", "5px" ) ]
                    , onInput SearchQueryChanged
                    ]
                    [ text "" ]
                , viewSearchResults wdSearchResults
                ]
        else
            text ""


viewCustomerOrder : WebData CustomerOrder -> WebData (List SearchResult) -> Html.Html Msg
viewCustomerOrder wd wdSearchResults =
    let
        pageHeaderTitle : CustomerOrder -> String
        pageHeaderTitle co =
            "Заказ клиента: " ++ co.number
    in
        case wd of
            RemoteData.Success customerOrder ->
                div [ Html.Attributes.id "content" ]
                    [ pageHeaderTitle customerOrder |> pageHeader
                    , div [ class "well well-white" ]
                        [ Html.node "form-nav-buttons"
                            []
                            [ div [ class "btn-group" ]
                                [ button [ "/#/customer_orders/" |> Html.Attributes.href ] [] "arrow-left" "К списку"
                                , Html.Texenergo.Button.render "repeat" "Пересчитать"
                                , Html.Texenergo.Button.render "book" "История"
                                , button [ RefreshCustomerOrder customerOrder.id |> onClick ] [] "refresh" "Обновить"
                                , Html.Texenergo.Button.render "file-pdf-o" "Печатная форма"
                                ]
                            ]
                        ]
                    , div [ class "well well-white" ]
                        [ viewMetaBlock customerOrder
                        ]
                    , viewSearchBlock customerOrder wdSearchResults
                    , div [ class "well well-white" ]
                        [ viewContentsBlock customerOrder
                        ]
                    , div [ class "well well-white" ]
                        [ viewDocumentsBlock customerOrder
                        ]
                    ]

            RemoteData.Failure str ->
                toString str |> text

            RemoteData.Loading ->
                text "Загружается"

            _ ->
                text "Ошибка"


view : Model -> Html.Html Msg
view m =
    viewCustomerOrder m.customerOrder m.searchResults


init : Flagz -> ( Model, Cmd Msg )
init flags =
    let
        initModel =
            Model RemoteData.Loading (initFlags flags) (SearchQuery "") RemoteData.NotAsked
    in
        ( initModel
        , fetchCustomerOrder (Endpoint flags.apiEndpoint) (ApiAuthToken flags.authToken) (CustomerOrderId flags.objId)
        )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


main : Program Flagz Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
