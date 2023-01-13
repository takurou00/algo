

n = gets.to_i

box = Array.new(2*10**5) { Array.new(2,0) }

 n.times do 
    a,b = gets.chomp.split(" ").map(&:to_i)

    box[a].push(b)
    box[b].push(a)
 end

 p box
    