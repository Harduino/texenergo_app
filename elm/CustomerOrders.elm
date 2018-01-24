-- https://auth0.com/blog/creating-your-first-elm-app-part-1/
-- elm-make CustomerOrders.elm --output ../public/elm.js


module CustomerOrders exposing (CustomerOrder)

import Date exposing (Date)
import Html exposing (div, text, tr, td, th)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onInput, onClick)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Json.Encode
import Utils.Date
import Utils.Currency exposing (toCurrency)
import Html.Texenergo exposing (pageHeader)
import RemoteData exposing (WebData)
import Partner.Model exposing (Partner, PartnerConfig, partnerDecoder, initPartnerConf, initPartner)


type alias Model =
    { customerOrders : WebData (List CustomerOrder)
    , filter : String
    , newCustomerOrderOpened : Bool
    , newCustomerOrder : NewCustomerOrder
    , flags : Flags
    , page : Int
    , lastPage : Bool
    , partnerConf : PartnerConfig
    }


type alias Flags =
    { authToken : String
    , apiEndpoint : String
    }


type alias NewCustomerOrder =
    { title : String
    , description : String
    , partner : Partner
    , requestOriginal : String
    }


type alias CustomerOrder =
    { id : String
    , number : String
    , total : Float
    , status : String
    , title : String
    , transportation : String
    , date : Date
    , partner : Partner
    , canEdit : Bool
    , canDestroy : Bool
    }


type Msg
    = FetchCustomerOrders Int String
    | FetchedCustomerOrders (WebData (List CustomerOrder))
    | ChangeFilter String
    | FlipNewCustomerOrder
    | FlipEditingPartner
    | ChangeNewCustomerOrderTitle String
    | ChangeNewCustomerOrderDescription String
    | ChangeNewCustomerOrderRequestOriginal String
    | CreateCustomerOrder
    | CreatedCustomerOrder (Result Http.Error CustomerOrder)
    | LoadMoreCustomerOrders
    | RefreshCustomerOrders
    | DestroyCustomerOrder String
    | DestroyedCustomerOrder String (Result Http.Error ())
    | FilterKeyPressed Int
    | ChangePartnerFilter String
    | FetchedPartners (Result Http.Error (List Partner))
    | ChoosePartner Partner


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        setTitle : String -> NewCustomerOrder -> NewCustomerOrder
        setTitle str nco =
            { nco | title = str }

        setDescription : String -> NewCustomerOrder -> NewCustomerOrder
        setDescription str nco =
            { nco | description = str }

        setRequestOriginal : String -> NewCustomerOrder -> NewCustomerOrder
        setRequestOriginal str nco =
            { nco | requestOriginal = str }

        setPartner : Partner -> NewCustomerOrder -> NewCustomerOrder
        setPartner p nco =
            { nco | partner = p }

        isLastPage : WebData (List CustomerOrder) -> Bool
        isLastPage webData =
            case webData of
                RemoteData.Success xs ->
                    (List.length xs) < 25

                _ ->
                    False

        setPartnerFilter : String -> PartnerConfig -> PartnerConfig
        setPartnerFilter str pc =
            { pc | query = str }

        setPartnerList : List Partner -> PartnerConfig -> PartnerConfig
        setPartnerList lst pc =
            { pc | partners = lst }

        flipPartnerConf : PartnerConfig -> PartnerConfig
        flipPartnerConf pc =
            { pc | editing = not pc.editing }
    in
        case msg of
            FetchCustomerOrders p f ->
                ( { m | page = (m.page + 1) }, fetchCustomerOrders m p f )

            FetchedCustomerOrders xs ->
                ( { m | customerOrders = xs, lastPage = isLastPage xs }, Cmd.none )

            ChangeFilter str ->
                ( { m | filter = str }, Cmd.none )

            FlipNewCustomerOrder ->
                ( { m | newCustomerOrderOpened = not m.newCustomerOrderOpened }, Cmd.none )

            FlipEditingPartner ->
                ( { m | partnerConf = (flipPartnerConf m.partnerConf) }, Cmd.none )

            ChangeNewCustomerOrderTitle x ->
                ( { m | newCustomerOrder = (setTitle x m.newCustomerOrder) }, Cmd.none )

            ChangeNewCustomerOrderDescription x ->
                ( { m | newCustomerOrder = (setDescription x m.newCustomerOrder) }, Cmd.none )

            ChangeNewCustomerOrderRequestOriginal x ->
                ( { m | newCustomerOrder = (setRequestOriginal x m.newCustomerOrder) }, Cmd.none )

            CreateCustomerOrder ->
                ( m, createCustomerOrder m )

            CreatedCustomerOrder (Result.Err err) ->
                case err of
                    Http.BadPayload y z ->
                        Debug.log ("Http.BadPayload " ++ y)
                            ( m, Cmd.none )

                    _ ->
                        ( m, Cmd.none )

            CreatedCustomerOrder (Result.Ok x) ->
                ( { m | customerOrders = RemoteData.succeed [], page = 1 }, fetchCustomerOrders m 1 m.filter )

            LoadMoreCustomerOrders ->
                if m.lastPage then
                    ( m, Cmd.none )
                else
                    ( { m | page = (m.page + 1) }, fetchCustomerOrders m (m.page + 1) m.filter )

            RefreshCustomerOrders ->
                ( { m | customerOrders = RemoteData.Loading, page = 1 }, fetchCustomerOrders m 1 m.filter )

            DestroyCustomerOrder customerOrderId ->
                ( m, (destroyCustomerOrder m customerOrderId) )

            DestroyedCustomerOrder customerOrderId (Result.Ok y) ->
                let
                    filterOut : WebData (List CustomerOrder) -> WebData (List CustomerOrder)
                    filterOut webData =
                        case webData of
                            RemoteData.Success xs ->
                                List.filter (\co -> co.id /= customerOrderId) xs |> RemoteData.succeed

                            _ ->
                                webData
                in
                    ( { m | customerOrders = filterOut m.customerOrders }, Cmd.none )

            DestroyedCustomerOrder _ (Result.Err _) ->
                ( m, Cmd.none )

            FilterKeyPressed keyCode ->
                if keyCode == 13 then
                    ( { m | customerOrders = RemoteData.succeed [], page = 1 }, fetchCustomerOrders m 1 m.filter )
                else
                    ( m, Cmd.none )

            ChangePartnerFilter str ->
                ( { m | partnerConf = (setPartnerFilter str m.partnerConf) }
                , if String.length str >= 2 then
                    fetchPartners m str
                  else
                    Cmd.none
                )

            FetchedPartners (Result.Ok partners) ->
                ( { m | partnerConf = (setPartnerList partners m.partnerConf) }, Cmd.none )

            FetchedPartners (Result.Err err) ->
                case err of
                    Http.BadPayload y z ->
                        Debug.log ("Http.BadPayload " ++ y)
                            ( m, Cmd.none )

                    _ ->
                        ( m, Cmd.none )

            ChoosePartner partner ->
                ( { m | newCustomerOrder = setPartner partner m.newCustomerOrder, partnerConf = (flipPartnerConf m.partnerConf) }, Cmd.none )


destroyCustomerOrder : Model -> String -> Cmd Msg
destroyCustomerOrder m customerOrderId =
    Http.request
        { method = "DELETE"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
            ]
        , url = m.flags.apiEndpoint ++ "/customer_orders/" ++ customerOrderId
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send (DestroyedCustomerOrder customerOrderId)


createCustomerOrder : Model -> Cmd Msg
createCustomerOrder m =
    let
        nco =
            m.newCustomerOrder
    in
        Http.request
            { method = "POST"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
                ]
            , url = m.flags.apiEndpoint ++ "/customer_orders"
            , body = Http.jsonBody (encodeCustomerOrder nco)
            , expect = Http.expectJson customerOrderDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send CreatedCustomerOrder


encodeCustomerOrder : NewCustomerOrder -> Json.Encode.Value
encodeCustomerOrder no =
    Json.Encode.object
        [ ( "title", Json.Encode.string no.title )
        , ( "description", Json.Encode.string no.description )
        , ( "request_original", Json.Encode.string no.requestOriginal )
        , ( "partner_id", Json.Encode.string no.partner.id )
        , ( "issued_by", Json.Encode.string "" )
        ]


customerOrdersDecoder : Decode.Decoder (List CustomerOrder)
customerOrdersDecoder =
    Decode.list customerOrderDecoder


customerOrderDecoder : Decode.Decoder CustomerOrder
customerOrderDecoder =
    Decode.succeed CustomerOrder
        |> required "id" string
        |> required "number" string
        |> required "total" float
        |> required "status" string
        |> required "title" string
        |> required "transportation" string
        |> required "date" Utils.Date.decoder
        |> required "partner" partnerDecoder
        |> required "can_edit" bool
        |> required "can_destroy" bool


fetchCustomerOrders : Model -> Int -> String -> Cmd Msg
fetchCustomerOrders m p f =
    let
        queryString =
            "?q=" ++ f ++ "&page=" ++ (toString p)

        endpoint =
            m.flags.apiEndpoint ++ "/customer_orders" ++ queryString
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson customerOrdersDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedCustomerOrders


fetchPartners : Model -> String -> Cmd Msg
fetchPartners m f =
    let
        endpoint =
            (m.flags.apiEndpoint ++ "/partners?q=" ++ f)
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson (Decode.list partnerDecoder)
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send FetchedPartners


initNewCustomerOrder : NewCustomerOrder
initNewCustomerOrder =
    NewCustomerOrder "" "" initPartner ""


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        initModel =
            Model RemoteData.Loading "" False initNewCustomerOrder flags 1 False initPartnerConf
    in
        ( initModel, fetchCustomerOrders initModel 1 "" )


view : Model -> Html.Html Msg
view m =
    div [ Html.Attributes.id "content" ]
        [ pageHeader "Заказы клиентов"
        , div [ class "well well-white" ]
            [ Html.node "form-nav-buttons"
                []
                [ div [ class "btn-group" ]
                    [ div
                        [ class "btn btn-success"
                        , onClick FlipNewCustomerOrder
                        ]
                        [ Html.i [ class "fa fa-plus" ] []
                        , text "Новый"
                        ]
                    , div
                        [ class "btn btn-success"
                        , onClick RefreshCustomerOrders
                        ]
                        [ Html.i
                            [ class "fa fa-refresh"
                            ]
                            []
                        , text "Обновить"
                        ]
                    ]
                ]
            , (if m.newCustomerOrderOpened then
                viewNewCustomerOrder m
               else
                viewQueryFilter m
              )
            ]
        , div [ class "well well-white" ]
            [ Html.table [ class "table table-bordered hidden-xs" ]
                [ Html.thead []
                    [ tr []
                        [ th [ class "hidden-xs" ]
                            [ Html.i [ class "fa fa-truck" ] []
                            ]
                        , th [] [ text "Номер" ]
                        , th [] [ text "Свой номер" ]
                        , th [] [ text "Статус" ]
                        , th [] [ text "Дата" ]
                        , th [] [ text "Партнер" ]
                        , th [] [ text "Итого" ]
                        , th [] []
                        ]
                    ]
                , Html.tbody []
                    (case m.customerOrders of
                        RemoteData.Success xs ->
                            (List.map viewCustomerOrder xs)

                        RemoteData.Loading ->
                            [ text "Загружается" ]

                        RemoteData.Failure _ ->
                            [ text "Ошибка при загрузке" ]

                        RemoteData.NotAsked ->
                            [ div
                                [ style [ ( "width", "100%" ), ( "text-align", "center" ) ]
                                ]
                                [ text "Запрошено" ]
                            ]
                    )
                ]
            , div [ class "hidden-sm hidden-md hidden-lg", style [ ( "overflow-y", "auto" ) ] ]
                ((case m.customerOrders of
                    RemoteData.Success xs ->
                        (List.map viewCustomerOrderMobile xs)

                    RemoteData.Loading ->
                        [ text "Загружается" ]

                    RemoteData.Failure _ ->
                        [ text "Ошибка при загрузке" ]

                    RemoteData.NotAsked ->
                        [ text "Запрошено" ]
                 )
                )
            , viewLoadMore m
            ]
        ]


viewLoadMore : Model -> Html.Html Msg
viewLoadMore m =
    case m.customerOrders of
        RemoteData.Success _ ->
            if m.lastPage then
                Html.span [] []
            else
                div
                    [ onClick LoadMoreCustomerOrders
                    , style [ ( "width", "100%" ), ( "text-align", "center" ) ]
                    ]
                    [ Html.span [ class "editable-click a.editable-click" ]
                        [ text "Загрузить ещё"
                        ]
                    ]

        _ ->
            text ""


onEnter : Msg -> Html.Attribute Msg
onEnter message =
    Html.Events.on "keydown" (Decode.succeed RefreshCustomerOrders)


onKeyUp : (Int -> Msg) -> Html.Attribute Msg
onKeyUp tagger =
    Html.Events.on "keyup" (Decode.map tagger Html.Events.keyCode)


viewQueryFilter : Model -> Html.Html Msg
viewQueryFilter m =
    Html.span []
        [ Html.hr [] []
        , div [ class "smart-form col-xs-12 col-md-6 col-lg-5 no-padding" ]
            [ Html.node "section"
                []
                [ Html.label [ class "label" ]
                    [ text "Запрос"
                    ]
                , Html.label [ class "input" ]
                    [ Html.input
                        [ Html.Attributes.type_ "text"
                        , Html.Attributes.placeholder "Введите часть номера"
                        , class "input-sm"
                        , Html.Events.onInput ChangeFilter
                        , onKeyUp FilterKeyPressed
                        ]
                        []
                    ]
                ]
            ]
        , Html.button
            [ class "btn btn-primary un-float margin-bottom-10"
            , onClick RefreshCustomerOrders
            ]
            [ Html.i [ class "fa fa-search" ] []
            , text "Поиск"
            ]
        ]


viewPartnerOption : Partner -> Html.Html Msg
viewPartnerOption p =
    div
        [ class "col-md-2"
        ]
        [ Html.span [ onClick (ChoosePartner p), class "editable-click" ] [ String.left 20 p.name |> text ]
        ]



--viewPartnerEditing : Model -> Html.Html Msg
--viewPartnerEditing m =


viewPartnerSection : Model -> Html.Html Msg
viewPartnerSection m =
    Html.section [ class "form-group", style [ ( "overflow-y", "auto" ) ] ]
        [ Html.label [ class "control-label" ] [ text "Партнёр" ]
        , Html.br [] []
        , if m.partnerConf.editing then
            Html.span []
                [ Html.input
                    [ class "input-sm form-control"
                    , onInput ChangePartnerFilter
                    , Html.Attributes.placeholder "Введите ИНН или префикс"
                    ]
                    [ text m.newCustomerOrder.partner.name
                    ]
                , Html.span [] (List.map viewPartnerOption m.partnerConf.partners)
                ]
          else
            Html.span [ onClick FlipEditingPartner, class "editable-click" ]
                [ if String.length m.newCustomerOrder.partner.name == 0 then
                    "Изменить" |> text
                  else
                    m.newCustomerOrder.partner.name |> text
                ]
        ]


viewNewCustomerOrder : Model -> Html.Html Msg
viewNewCustomerOrder m =
    Html.span []
        [ Html.h4 []
            [ text "Создать новый заказ"
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Свой номер" ]
            , Html.input
                [ class "input-sm form-control"
                , onInput ChangeNewCustomerOrderTitle
                ]
                [ text m.newCustomerOrder.title
                ]
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Описание" ]
            , Html.input
                [ class "input-sm form-control"
                , onInput ChangeNewCustomerOrderDescription
                ]
                [ text m.newCustomerOrder.description
                ]
            ]
        , viewPartnerSection m
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Оригинал заявки" ]
            , Html.textarea
                [ class "input-sm form-control"
                , onInput ChangeNewCustomerOrderDescription
                ]
                [ text m.newCustomerOrder.requestOriginal
                ]
            ]
        , Html.button
            [ class "btn btn-default"
            , onClick FlipNewCustomerOrder
            ]
            [ text "Отмена"
            ]
        , Html.button
            [ class "btn btn-primary"
            , onClick CreateCustomerOrder
            ]
            [ text "Сохранить"
            ]
        ]


viewCustomerOrderMobile : CustomerOrder -> Html.Html Msg
viewCustomerOrderMobile co =
    div
        [ class "col-xs-12"
        , style [ ( "margin-bottom", "10px" ), ( "border-bottom", "1px solid" ), ( "padding-bottom", "10px" ) ]
        ]
        [ div []
            [ text "Номер: "
            , Html.a [ Html.Attributes.href ("/#/customer_orders/" ++ co.id) ] [ text co.number ]
            ]
        , div []
            [ "Статус: " ++ co.status |> text
            ]
        , div []
            [ "Дата: " ++ Utils.Date.toHuman co.date |> text
            ]
        , div []
            [ "Партнёр: " ++ co.partner.name |> text
            ]
        , div []
            [ "Итого: " ++ (toCurrency co.total) |> text
            ]
        ]


viewCustomerOrder : CustomerOrder -> Html.Html Msg
viewCustomerOrder co =
    let
        trashAttrsDefault : List (Html.Attribute Msg)
        trashAttrsDefault =
            [ class "btn btn-xs btn-danger"
            , onClick (DestroyCustomerOrder co.id)
            ]

        trashAttrs : List (Html.Attribute Msg)
        trashAttrs =
            if co.canDestroy then
                trashAttrsDefault
            else
                (Html.Attributes.attribute "disabled" "true") :: trashAttrsDefault
    in
        tr []
            [ td [ class "hidden-xs" ] [ String.left 1 (co.transportation) |> text ]
            , td [] [ text co.number ]
            , td [] [ text co.title ]
            , td [ class "hidden-xs" ] [ text co.status ]
            , td [] [ Utils.Date.toHuman co.date |> text ]
            , td [] [ text co.partner.name ]
            , td [ class "text-right" ] [ toCurrency co.total |> text ]
            , td [ class "center-item-text" ]
                [ Html.node "form-nav-buttons"
                    [ class "btn-group", Html.Attributes.attribute "data-template" "table" ]
                    [ Html.a [ class "btn btn-xs btn-info", Html.Attributes.href ("/#/customer_orders/" ++ co.id) ]
                        [ Html.i [ class "fa fa-eye" ] []
                        ]
                    , div trashAttrs
                        [ Html.i [ class "fa fa-trash-o" ] []
                        ]
                    ]
                ]
            ]


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = (\m -> Sub.none)
        }
