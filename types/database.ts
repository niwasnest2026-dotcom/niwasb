export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          city: string
          area: string | null
          property_type: string
          price: number
          original_price: number | null
          security_deposit: number | null
          available_months: number | null
          rating: number | null
          review_count: number | null
          instant_book: boolean | null
          verified: boolean | null
          secure_booking: boolean | null
          featured_image: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          city: string
          area?: string | null
          property_type?: string
          price: number
          original_price?: number | null
          security_deposit?: number | null
          available_months?: number | null
          rating?: number | null
          review_count?: number | null
          instant_book?: boolean | null
          verified?: boolean | null
          secure_booking?: boolean | null
          featured_image?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          city?: string
          area?: string | null
          property_type?: string
          price?: number
          original_price?: number | null
          security_deposit?: number | null
          available_months?: number | null
          rating?: number | null
          review_count?: number | null
          instant_book?: boolean | null
          verified?: boolean | null
          secure_booking?: boolean | null
          featured_image?: string | null
          created_at?: string | null
        }
      }
      amenities: {
        Row: {
          id: string
          name: string
          icon_name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          icon_name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          icon_name?: string
          created_at?: string | null
        }
      }
      property_amenities: {
        Row: {
          id: string
          property_id: string
          amenity_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          amenity_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          amenity_id?: string
          created_at?: string | null
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          display_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          image_url: string
          display_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          image_url?: string
          display_order?: number | null
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          phone_number: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string | null
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      property_rooms: {
        Row: {
          id: string
          property_id: string
          room_number: string
          room_type: string | null
          sharing_type: string
          price_per_person: number
          security_deposit_per_person: number | null
          total_beds: number
          available_beds: number
          floor_number: number | null
          has_attached_bathroom: boolean | null
          has_balcony: boolean | null
          has_ac: boolean | null
          room_size_sqft: number | null
          description: string | null
          is_available: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          room_number: string
          room_type?: string | null
          sharing_type: string
          price_per_person: number
          security_deposit_per_person?: number | null
          total_beds: number
          available_beds: number
          floor_number?: number | null
          has_attached_bathroom?: boolean | null
          has_balcony?: boolean | null
          has_ac?: boolean | null
          room_size_sqft?: number | null
          description?: string | null
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          room_number?: string
          room_type?: string | null
          sharing_type?: string
          price_per_person?: number
          security_deposit_per_person?: number | null
          total_beds?: number
          available_beds?: number
          floor_number?: number | null
          has_attached_bathroom?: boolean | null
          has_balcony?: boolean | null
          has_ac?: boolean | null
          room_size_sqft?: number | null
          description?: string | null
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      room_images: {
        Row: {
          id: string
          room_id: string
          image_url: string
          display_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          image_url: string
          display_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          image_url?: string
          display_order?: number | null
          created_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          room_id: string
          user_id: string | null
          guest_name: string
          guest_email: string
          guest_phone: string
          sharing_type: string
          price_per_person: number
          security_deposit_per_person: number
          total_amount: number
          amount_paid: number
          amount_due: number
          payment_method: string
          payment_status: string | null
          booking_status: string | null
          check_in_date: string | null
          check_out_date: string | null
          booking_date: string | null
          payment_date: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          room_id: string
          user_id?: string | null
          guest_name: string
          guest_email: string
          guest_phone: string
          sharing_type: string
          price_per_person: number
          security_deposit_per_person: number
          total_amount: number
          amount_paid: number
          amount_due: number
          payment_method: string
          payment_status?: string | null
          booking_status?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          booking_date?: string | null
          payment_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          room_id?: string
          user_id?: string | null
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          sharing_type?: string
          price_per_person?: number
          security_deposit_per_person?: number
          total_amount?: number
          amount_paid?: number
          amount_due?: number
          payment_method?: string
          payment_status?: string | null
          booking_status?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          booking_date?: string | null
          payment_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Property = Database['public']['Tables']['properties']['Row']
export type Amenity = Database['public']['Tables']['amenities']['Row']
export type PropertyImage = Database['public']['Tables']['property_images']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type PropertyRoom = Database['public']['Tables']['property_rooms']['Row']
export type RoomImage = Database['public']['Tables']['room_images']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']

export interface PropertyWithDetails extends Property {
  amenities?: Amenity[]
  images?: PropertyImage[]
  rooms?: PropertyRoomWithImages[]
}

export interface PropertyRoomWithImages extends PropertyRoom {
  images?: RoomImage[]
}
