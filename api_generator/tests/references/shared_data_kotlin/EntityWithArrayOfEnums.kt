// Generated code. Do not modify.

package com.yandex.div2

import org.json.JSONObject

class EntityWithArrayOfEnums(
    @JvmField final val items: List<Item>, // at least 1 elements
) : Hashable {

    private var _hash: Int? = null 

    override fun hash(): Int {
        _hash?.let {
            return it
        }
        val hash = 
            items.hashCode()
        _hash = hash
        return hash
    }

    fun copyWithNewProperties(
        items: List<EntityWithArrayOfEnums.Item>,
    ) = EntityWithArrayOfEnums(
        items,
    )

    companion object {
        const val TYPE = "entity_with_array_of_enums"

        private val ITEMS_VALIDATOR = ListValidator<EntityWithArrayOfEnums.Item> { it: List<*> -> it.size >= 1 }
    }


    enum class Item(private val value: String) {
        FIRST("first"),
        SECOND("second");

        companion object Converter {
            fun toString(obj: Item): String {
                return obj.value
            }

            fun fromString(string: String): Item? {
                return when (string) {
                    FIRST.value -> FIRST
                    SECOND.value -> SECOND
                    else -> null
                }
            }

            val FROM_STRING = { string: String ->
                when (string) {
                    FIRST.value -> FIRST
                    SECOND.value -> SECOND
                    else -> null
                }
            }
        }
    }
}
