module TextMaterial exposing (..)

import Date exposing (Date)
import Date.Format
import Html exposing (div, text, tr, td, th, p)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)
import Markdown
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Encode
import Html.Texenergo exposing (pageHeader)
import Html.Texenergo.Button
import Texenergo.Flags exposing (Flags, Flagz, Endpoint(..), ApiAuthToken(..))
import Texenergo.Ports
import Utils.Date


type Msg
    = FetchedTextMaterial (Result Http.Error TextMaterial)
    | GetTinyMce
    | GotTinyMceContent String
    | UpdateTitle String
    | TextMaterialUpdated (Result Http.Error TextMaterial)
    | UpdateSite String
    | NewTextMaterialDate String


type TextMaterialId
    = TextMaterialId String


type alias TextMaterial =
    { id : TextMaterialId
    , title : String
    , date : Date
    , content : String
    , site : String
    , siteOptions : List String
    }


type alias Model =
    { flags : Flags
    , textMaterial : TextMaterial
    }


encodeTextMaterial : TextMaterial -> Json.Encode.Value
encodeTextMaterial textMaterial =
    Json.Encode.object
        [ ( "title", Json.Encode.string textMaterial.title )
        , ( "content", Json.Encode.string textMaterial.content )
        , ( "date", Date.Format.formatISO8601 textMaterial.date |> Json.Encode.string )
        , ( "site", Json.Encode.string textMaterial.site )
        ]


updateTextMaterial : Endpoint -> ApiAuthToken -> TextMaterial -> Cmd Msg
updateTextMaterial (Endpoint ep) (ApiAuthToken aat) textMaterial =
    let
        textMaterialIdToString : TextMaterialId -> String
        textMaterialIdToString (TextMaterialId x) =
            x
    in
        Http.request
            { method = "PUT"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ aat)
                ]
            , url = ep ++ "/text_materials/" ++ (textMaterialIdToString textMaterial.id)
            , body = Http.jsonBody (encodeTextMaterial textMaterial)
            , expect = Http.expectJson textMaterialDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send (TextMaterialUpdated)


textMaterialDecoder : Decode.Decoder TextMaterial
textMaterialDecoder =
    Decode.map6 TextMaterial
        (Decode.field "id" (string |> Decode.map TextMaterialId))
        (Decode.field "title" string)
        (Decode.field "date" Utils.Date.decoder)
        (Decode.field "content" string)
        (Decode.field "site" string)
        (Decode.field "site_options" (Decode.list string))


fetchTextMaterial : Endpoint -> ApiAuthToken -> TextMaterialId -> Cmd Msg
fetchTextMaterial (Endpoint ep) (ApiAuthToken aat) (TextMaterialId tmId) =
    Http.request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ aat)
            ]
        , url = ep ++ "/text_materials/" ++ tmId
        , body = Http.emptyBody
        , expect = Http.expectJson textMaterialDecoder
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send FetchedTextMaterial


init : Flagz -> ( Model, Cmd Msg )
init fs =
    let
        initTextMaterial : TextMaterial
        initTextMaterial =
            TextMaterial (TextMaterialId "") "" (Date.fromTime 0.0) "" "" []

        initModel : Model
        initModel =
            Model (Texenergo.Flags.initFlags fs) initTextMaterial
    in
        ( initModel, fetchTextMaterial (Endpoint fs.apiEndpoint) (ApiAuthToken fs.authToken) (TextMaterialId fs.objId) )


viewTextMaterial : TextMaterial -> Html.Html Msg
viewTextMaterial textMaterial =
    div [ class "row margin-top-10" ]
        [ p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Название:" ]
        , p [ class "col-md-9" ]
            [ Html.input
                [ Html.Attributes.value textMaterial.title
                , Html.Attributes.style
                    [ ( "width", "100%" )
                    , ( "padding", "5px" )
                    , ( "border-radius", "2px" )
                    , ( "border-width", "0.5px" )
                    ]
                , Html.Events.onInput UpdateTitle
                ]
                []
            ]
        , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Дата:" ]
        , p [ class "col-md-9" ]
            [ Html.input
                [ class "input-sm form-control"
                , Html.Attributes.id "datepicker"
                , Html.Attributes.value (toString textMaterial.date)
                ]
                []
            , textMaterial.date |> toString |> text
            ]
        , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Содержимое:" ]
        , p [ class "col-md-9" ] [ Markdown.toHtml [] textMaterial.content ]
        , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Содержимое TinyMCE:" ]
        , p [ class "col-md-9" ]
            [ Html.textarea [ Html.Attributes.id "myMce", Html.Attributes.value textMaterial.content ] []
            ]
        , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Категория" ]
        , p [ class "cold-md-9" ]
            [ Html.select [ Html.Events.onInput UpdateSite ]
                (List.map
                    (\option ->
                        Html.option [ Html.Attributes.value option ] [ text option ]
                    )
                    textMaterial.siteOptions
                )
            ]
        , p [ class "col-xs-12 col-md-3 font-bold" ]
            []
        , p [ class "col-md-9" ]
            [ Html.span [ Html.Events.onClick GetTinyMce ] [ text "Поехали" ]
            ]
        ]


viewMainBlock : TextMaterial -> Html.Html Msg
viewMainBlock tm =
    viewTextMaterial tm


view : Model -> Html.Html Msg
view model =
    div [ Html.Attributes.id "content" ]
        [ pageHeader "Текстовый Материал"
        , div [ class "well well-white" ]
            [ Html.span [] []
            , Html.node "form-nav-buttons"
                []
                [ div [ class "btn-group" ]
                    [ Html.Texenergo.Button.backButton "/#/texts"
                    , div
                        [ class "btn btn-success"
                        ]
                        [ Html.i [ class "fa fa-refresh" ] []
                        , text "Обновить"
                        ]
                    ]
                ]
            ]
        , div [ class "well well-white" ]
            [ viewMainBlock model.textMaterial
            ]
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        setContent : String -> TextMaterial -> TextMaterial
        setContent newContent tm =
            { tm | content = newContent }

        setTitle : String -> TextMaterial -> TextMaterial
        setTitle newTitle tm =
            { tm | title = newTitle }

        setSite : String -> TextMaterial -> TextMaterial
        setSite newSite tm =
            { tm | site = newSite }

        setDate : Date -> TextMaterial -> TextMaterial
        setDate str nit =
            { nit | date = str }
    in
        case msg of
            FetchedTextMaterial (Ok tm) ->
                ( { m | textMaterial = tm }
                , Cmd.batch
                    [ Texenergo.Ports.toJsSetTinyMce "Set TinyMCE"
                    , Texenergo.Ports.setPicker "Called picker"
                    ]
                )

            FetchedTextMaterial (Result.Err err) ->
                Debug.log (toString err)
                    ( m, Cmd.none )

            GetTinyMce ->
                ( m, Texenergo.Ports.toJsGetTinyMce "Get TinyMCE" )

            GotTinyMceContent newContent ->
                ( { m | textMaterial = (setContent newContent m.textMaterial) }
                , updateTextMaterial m.flags.apiEndpoint m.flags.apiAuthToken (setContent newContent m.textMaterial)
                )

            TextMaterialUpdated (Ok newTextMaterial) ->
                ( { m | textMaterial = newTextMaterial }, Cmd.none )

            TextMaterialUpdated (Err err) ->
                Debug.log (toString err)
                    ( m, Cmd.none )

            NewTextMaterialDate newDate ->
                case Date.fromString newDate of
                    Ok x ->
                        ( { m | textMaterial = setDate x m.textMaterial }, Cmd.none )

                    Err _ ->
                        ( m, Cmd.none )

            UpdateTitle newTitle ->
                ( { m | textMaterial = (setTitle newTitle m.textMaterial) }, Cmd.none )

            UpdateSite newSite ->
                ( { m | textMaterial = (setSite newSite m.textMaterial) }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Texenergo.Ports.fromJsTinyMceContent GotTinyMceContent
        , Texenergo.Ports.setDat NewTextMaterialDate
        ]


main : Program Flagz Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
