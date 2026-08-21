; Variable
(identifier) @variable

; Keywords
; --------------------
[
    (const_builtin)
    (void_type)
    (final_builtin)
    (case_builtin)
    "abstract"
    "as"
    "async"
    "async*"
    "await"
    "catch"
    "class"
    "continue"
    "covariant"
    "default"
    "deferred"
    "do"
    "else"
    "enum"
    "export"
    "extends"
    "extension"
    "external"
    "factory"
    "finally"
    "for"
    "Function"
    "hide"
    "if"
    "implements"
    "import"
    "in"
    "interface"
    "is"
    "late"
    "library"
    "mixin"
    "new"
    "on"
    "part"
    "required"
    "return"
    "show"
    "static"
    "super"
    "switch"
    "sync*"
    "throw"
    "try"
    "typedef"
    "var"
    "while"
    "with"
    "yield"
] @keyword

; Methods
; --------------------

; NOTE: This query is a bit of a work around for the fact that the dart grammar doesn't
; specifically identify a node as a function call
(((identifier) @entity.function (#match? @entity.function "^_?[a-z]"))
 . (selector . (argument_part))) @entity.function

; Operators and Tokens
; --------------------
(template_substitution
  "$" @punctuation.special
  "{" @punctuation.special
  "}" @punctuation.special
) @none

(template_substitution
  "$" @punctuation.special
  (identifier_dollar_escaped) @variable
) @none

(escape_sequence) @string.escape

[
 "@"
 "=>"
 ".."
 "??"
 "=="
 "?"
 ":"
 "&&"
 "%"
 "<"
 ">"
 "="
 ">="
 "<="
 "||"
 "~/"
 (increment_operator)
 (is_operator)
 (prefix_operator)
 (equality_operator)
 (additive_operator)
] @operator

(type_arguments
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

(type_parameters
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

; Delimiters
; --------------------
[
  ";"
  "."
  ","
] @punctuation.delimiter

; Types
; --------------------
(type_identifier) @entity.type
((type_identifier) @entity.type.builtin
  (#match? @entity.type.builtin "^(int|double|String|bool|List|Set|Map|Runes|Symbol)$"))
(class_definition
  name: (identifier) @entity.type)
(constructor_signature
  name: (identifier) @entity.type)
(scoped_identifier
  scope: (identifier) @entity.type)
(function_signature
  name: (identifier) @entity.function)
(getter_signature
  "get" @keyword
  (identifier) @entity.function)
(setter_signature
  "set" @keyword
  name: (identifier) @entity.function)
(operator_signature
  "operator" @keyword)

((scoped_identifier
  scope: (identifier) @entity.type
  name: (identifier) @entity.type)
 (#match? @entity.type "^[a-zA-Z]"))

; Enums
; -------------------
(enum_declaration
  name: (identifier) @entity.type)
(enum_constant
  name: (identifier) @identifier.constant)

; Variables
; --------------------
; var keyword
(inferred_type) @keyword

((identifier) @entity.type
 (#match? @entity.type "^_?[A-Z].*[a-z]"))

("Function" @entity.type)

(this) @variable.builtin

; properties

(unconditional_assignable_selector
  (identifier) @property)

(conditional_assignable_selector
  (identifier) @property)

(cascade_section
  (cascade_selector
    (identifier) @property))

((selector
  (unconditional_assignable_selector (identifier) @entity.function))
  (selector (argument_part (arguments)))
)

(cascade_section
  (cascade_selector (identifier) @entity.function)
  (argument_part (arguments))
)

; assignments
(assignment_expression
  left: (assignable_expression) @variable)

(this) @variable.builtin

; Parameters
; --------------------
(formal_parameter
    name: (identifier) @identifier.parameter)

(named_argument
  (label (identifier) @identifier.parameter))

; Literals
; --------------------
[
    (hex_integer_literal)
    (decimal_integer_literal)
    (decimal_floating_point_literal)
    ; TODO: inaccessbile nodes
    ; (octal_integer_literal)
    ; (hex_floating_point_literal)
] @constant.numeric

(string_literal) @string
(symbol_literal (identifier) @constant) @constant
(true) @constant.boolean
(false) @constant.boolean
(null_literal) @constant.null

(documentation_comment) @comment
(comment) @comment

; Annotations
; --------------------
(annotation
  "@" @entity.decorator
  name: (identifier) @entity.decorator)

; NOTE: Dart 3 pattern-matching/extension-type constructs (extension types,
; switch guards, object/record patterns, record types) are not queried here:
; the vendored grammar build predates those language features (see this
; directory's README for why an older ABI-compatible build is used).

