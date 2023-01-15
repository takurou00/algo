### 2分探索

# method
ary = [0, 4, 7, 10, 12]
ary.bsearch {|x| x >=   4 } # => 4
ary.bsearch {|x| x >=   6 } # => 7
ary.bsearch {|x| x >=  -1 } # => 0
ary.bsearch {|x| x >= 100 } # => nil

ary = [0, 4, 7, 10, 12]
ary.bsearch_index { |x| x >=   4 } # => 1
ary.bsearch_index { |x| x >=   6 } # => 2
ary.bsearch_index { |x| x >=  -1 } # => 0
ary.bsearch_index { |x| x >= 100 } # => nil

def binary_search(array,target)
  head = 0
  tail = array.length - 1

  while head <= tail 
    center = ((tail + tail) / 2)

     if array[center] == target 
        return center 
     elsif array[center] < target
        head = center + 1
     else
        tail = center - 1
     end
  end
end

### 整数

## 最大公約数
2.gcd(2)                    # => 2
3.gcd(7)                    # => 1
3.gcd(-7)                   # => 1
((1<<31)-1).gcd((1<<61)-1)  # => 1

## 最小公倍数
2.lcm(2)                    # => 2
3.lcm(-7)                   # => 21
((1<<31)-1).lcm((1<<61)-1)  # => 4951760154835678088235319297

## ユークリッド互除

### 探索

## 幅優先

require 'set'

n = gets.chomp.to_i

done = Set[1]

g = {}

n.times {
	a, b = gets.split.map(&:to_i)
	if g.key?(a)
		g[a] << b
	else
		g[a] = [b]
	end
	if g.key?(b)
		g[b] << a
	else
		g[b] = [a]
	end
}

queue = []
queue.push(1)
done << 1

ans = 1
while !queue.empty?
	now = queue.shift
	if g.key?(now)
		to = g[now]
		to.each {|nv|
			if !done.include?(nv)
				queue.push(nv)
				done << nv
				ans = [ans, nv].max
			end
		}
	end
end

puts ans



  
